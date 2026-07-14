import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/security/sanitize-error';

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle();
  return Boolean(data);
}

export async function recordWebhookEvent(
  event: Stripe.Event,
  paymentIntentId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    payment_intent_id: paymentIntentId,
    metadata,
  });

  if (error && !error.message.includes('duplicate')) {
    logServerError('recordWebhookEvent', error);
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
  if (await isWebhookEventProcessed(event.id)) {
    return;
  }

  let paymentIntentId: string | null = null;
  let metadata: Record<string, unknown> = {};

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    paymentIntentId = intent.id;

    if (event.type === 'payment_intent.succeeded') {
      const result = await reconcilePaymentIntentSucceeded(intent);
      metadata = { reconciled: result.reconciled, order_id: result.orderId ?? null };
    } else {
      metadata = { status: intent.status, last_error: intent.last_payment_error?.message ?? null };
    }
  }

  await recordWebhookEvent(event, paymentIntentId, metadata);
}
