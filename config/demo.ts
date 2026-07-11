import { isStripeEnabled } from '@/lib/stripe/config';

/**
 * Demo mode is used when Stripe keys are not configured.
 * Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for live payments.
 */
export const isDemoMode = !isStripeEnabled;
