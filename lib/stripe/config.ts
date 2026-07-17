import 'server-only';

/**
 * Server-only Stripe configuration. Client code must use `@/lib/stripe/client`.
 */

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? '';

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY?.trim() ?? '';

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';

export const isStripeEnabled = Boolean(STRIPE_PUBLISHABLE_KEY && STRIPE_SECRET_KEY);

export const STRIPE_CURRENCY = 'eur' as const;

/** Stripe payment methods enabled for Malta / EUR checkout */
export const STRIPE_PAYMENT_METHOD_TYPES = [
  'card',
  'revolut_pay',
  'bancontact',
  'eps',
  'ideal',
  'p24',
  'mb_way',
] as const;

export function toStripeAmount(eurTotal: number): number {
  return Math.round(eurTotal * 100);
}
