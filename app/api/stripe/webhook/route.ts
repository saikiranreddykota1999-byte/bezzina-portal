import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { getStripe } from '@/lib/stripe/server';

export async function POST(request: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
      // Orders are created after client-side confirmation; webhook is for audit/monitoring.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
