import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@/lib/stripe/config';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
      typescript: true,
    });
  }

  return stripeClient;
}
