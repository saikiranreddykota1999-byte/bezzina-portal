import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { getStripe } from '@/lib/stripe/server';
import { handleStripeWebhookEvent } from '@/services/stripe-webhook.service';
import { logServerError } from '@/lib/security/sanitize-error';

export async function POST(request: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    logServerError('stripe_webhook', new Error('Webhook secret not configured'));
    return NextResponse.json({ error: 'Webhook unavailable' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logServerError('stripe_webhook_verify', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(event);
  } catch (error) {
    logServerError('stripe_webhook_handle', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
