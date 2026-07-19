import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
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
  const admin = createAdminClient();
  const paymentIntentId = paymentIntent.id;
  const userId = paymentIntent.metadata?.user_id;

  const { data: existingOrder } = await admin
    .from('orders')
    .select('id, payment_status, user_id')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (existingOrder) {
    if (existingOrder.payment_status !== 'paid') {
      await admin
        .from('orders')
        .update({ payment_status: 'paid', payment_method: 'stripe' })
        .eq('id', existingOrder.id);
    }
    return { reconciled: true, orderId: existingOrder.id };
  }

  if (userId && paymentIntent.status === 'succeeded') {
    logServerError(
      'stripe_webhook_orphan_payment',
      new Error(`PaymentIntent ${paymentIntentId} succeeded without matching order for user ${userId}`),
    );
  }

  return { reconciled: false };
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
    await releaseWebhookEventClaim(event.id);
    throw error;
  }
}
