import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { captureException } from '@/lib/monitoring/capture';
import { isPaymentIntentSucceeded } from '@/lib/payment/stripe-intent-status';
import { logServerError } from '@/lib/security/sanitize-error';

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '23505' || Boolean(error.message?.toLowerCase().includes('duplicate'));
}

/**
 * Atomically claims a webhook event for processing.
 * Returns false when the event was already recorded (idempotent skip).
 */
export async function claimWebhookEvent(
  event: Stripe.Event,
  paymentIntentId: string | null,
): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    payment_intent_id: paymentIntentId,
    metadata: { status: 'processing' },
  });

  if (isUniqueViolation(error)) {
    return false;
  }

  if (error) {
    logServerError('claimWebhookEvent', error);
    captureException(error, {
      op: 'claimWebhookEvent',
      eventType: event.type,
      paymentIntentId,
    });
    throw new Error('Failed to claim webhook event');
  }

  return true;
}

export async function finalizeWebhookEvent(
  eventId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('stripe_webhook_events')
    .update({ metadata })
    .eq('event_id', eventId);

  if (error) {
    logServerError('finalizeWebhookEvent', error);
  }
}

/** Unclaims a failed event so Stripe can retry delivery. */
export async function releaseWebhookEventClaim(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('stripe_webhook_events').delete().eq('event_id', eventId);
  if (error) {
    logServerError('releaseWebhookEventClaim', error);
  }
}

export async function reconcilePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ reconciled: boolean; orderId?: string }> {
  if (!isPaymentIntentSucceeded(paymentIntent.status)) {
    return { reconciled: false };
  }

  const admin = createAdminClient();
  const paymentIntentId = paymentIntent.id;
  const userId = paymentIntent.metadata?.user_id;

  const { data: existingOrder } = await admin
    .from('orders')
    .select('id, payment_status, user_id, fulfillment_method, status, oms_status')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (existingOrder) {
    if (existingOrder.payment_status !== 'paid') {
      await applyStockForNewlyPaidOrder(
        admin,
        existingOrder.id,
        existingOrder.user_id ?? userId ?? 'system',
      );

      const fulfillableUpdate: Record<string, unknown> = {
        payment_status: 'paid',
        payment_method: 'stripe',
        status: 'confirmed',
      };

      if (existingOrder.fulfillment_method === 'store_pickup') {
        fulfillableUpdate.oms_status = 'approved';
        fulfillableUpdate.pickup_status = 'scheduled';
      }

      // Only one concurrent reconciler advances this order out of its prior status.
      const { error: transitionError } = await admin
        .from('orders')
        .update(fulfillableUpdate)
        .eq('id', existingOrder.id)
        .eq('payment_status', existingOrder.payment_status);

      if (transitionError) {
        logServerError('reconcilePaymentIntentSucceeded.update', transitionError);
        throw new Error(transitionError.message);
      }
    }
    return { reconciled: true, orderId: existingOrder.id };
  }

  if (userId) {
    const orphanError = new Error(
      `PaymentIntent ${paymentIntentId} succeeded without matching order for user ${userId}`,
    );
    logServerError('stripe_webhook_orphan_payment', orphanError);
    captureException(orphanError, {
      op: 'reconcilePaymentIntentSucceeded',
      paymentIntentId,
      userId,
    });
  }

  return { reconciled: false };
}

/**
 * Applies catalogue decrement + OMS reserve when a previously non-paid order becomes paid.
 * Idempotent via order timeline `stock_committed` marker and/or existing reserve txs.
 */
async function applyStockForNewlyPaidOrder(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  actorId: string,
): Promise<void> {
  const { data: orderRow, error: orderError } = await admin
    .from('orders')
    .select('timeline')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    logServerError('applyStockForNewlyPaidOrder.order', orderError);
    throw new Error(orderError.message);
  }

  const timeline = Array.isArray(orderRow?.timeline)
    ? (orderRow.timeline as Array<Record<string, unknown>>)
    : [];
  if (timeline.some((entry) => entry?.type === 'stock_committed')) {
    return;
  }

  const { data: existingReserve } = await admin
    .from('inventory_transactions')
    .select('id')
    .eq('order_id', orderId)
    .eq('transaction_type', 'reserve')
    .limit(1);

  if (existingReserve && existingReserve.length > 0) {
    await admin
      .from('orders')
      .update({
        timeline: [
          ...timeline,
          { type: 'stock_committed', at: new Date().toISOString(), source: 'existing_reserve' },
        ],
      })
      .eq('id', orderId);
    return;
  }

  const { data: orderItems, error: itemsError } = await admin
    .from('order_items')
    .select('product_id, quantity, name')
    .eq('order_id', orderId);

  if (itemsError) {
    logServerError('applyStockForNewlyPaidOrder.items', itemsError);
    throw new Error(itemsError.message);
  }

  const lines = (orderItems ?? [])
    .filter((item) => Boolean(item.product_id) && (item.quantity ?? 0) > 0)
    .map((item) => ({
      productId: item.product_id as string,
      quantity: item.quantity as number,
      name: (item.name as string | null) ?? undefined,
    }));

  if (lines.length === 0) return;

  const { decrementCatalogueStock } = await import('@/lib/checkout/stock');
  const { tryReserveInventoryForOrder } = await import('@/services/inventory.service');

  await decrementCatalogueStock(admin, lines);
  await tryReserveInventoryForOrder(
    admin,
    orderId,
    lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    actorId,
  );

  await admin
    .from('orders')
    .update({
      timeline: [
        ...timeline,
        { type: 'stock_committed', at: new Date().toISOString(), source: 'stripe_webhook' },
      ],
    })
    .eq('id', orderId);
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  let paymentIntentId: string | null = null;

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    paymentIntentId = (event.data.object as Stripe.PaymentIntent).id;
  }

  const claimed = await claimWebhookEvent(event, paymentIntentId);
  if (!claimed) {
    return;
  }

  try {
    let metadata: Record<string, unknown> = { status: 'processed' };

    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;

      if (event.type === 'payment_intent.succeeded') {
        const result = await reconcilePaymentIntentSucceeded(intent);
        metadata = {
          status: 'processed',
          reconciled: result.reconciled,
          order_id: result.orderId ?? null,
        };
      } else {
        metadata = {
          status: intent.status,
          last_error: intent.last_payment_error?.message ?? null,
        };
      }
    }

    await finalizeWebhookEvent(event.id, metadata);
  } catch (error) {
    logServerError('handleStripeWebhookEvent', error);
    captureException(error, {
      op: 'handleStripeWebhookEvent',
      eventId: event.id,
      eventType: event.type,
      paymentIntentId,
    });
    await releaseWebhookEventClaim(event.id);
    throw error;
  }
}
