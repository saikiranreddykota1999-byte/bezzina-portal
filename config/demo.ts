/**
 * Demo mode when Stripe publishable key is absent.
 * Uses the client-safe check so the banner works in the browser.
 */
import { isStripeClientEnabled } from '@/lib/stripe/client';

export const isDemoMode = !isStripeClientEnabled();
