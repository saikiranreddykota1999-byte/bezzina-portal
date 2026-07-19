'use server';

import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { buildCartFingerprint } from '@/lib/checkout/cart-fingerprint';
import { validateOrderItems } from '@/lib/checkout/validate-order-items';
import { calculateOrderTotals } from '@/lib/checkout';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import {
  isStripeEnabled,
  STRIPE_CURRENCY,
  toStripeAmount,
} from '@/lib/stripe/config';
import { getStripe } from '@/lib/stripe/server';
import { fulfillmentMethodSchema } from '@/lib/validators/pickup';
import { orderItemSchema } from '@/lib/validators/checkout';
import type { ActionResult } from '@/types/pickup';

const createPaymentIntentSchema = z.object({
  fulfillmentMethod: fulfillmentMethodSchema,
  items: z.array(orderItemSchema).min(1),
});

export type CreatePaymentIntentResult = ActionResult<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}>;

function isValidReceiptEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  return z.string().email().safeParse(email).success;
}

export async function createPaymentIntentAction(
  input: unknown,
): Promise<CreatePaymentIntentResult> {
  try {
    if (!isStripeEnabled) {
      return { success: false, error: 'Stripe is not configured' };
    }

    const parsed = createPaymentIntentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payment request',
      };
    }

    const session = await requireAuthenticatedUser();
    const { supabase, profile } = session;
    const user = session.user!;

    const { getClientIp, enforceRateLimit } = await import('@/lib/security/rate-limit');
    const ip = (await getClientIp()) ?? 'unknown';
    const allowed = await enforceRateLimit({
      action: 'create_payment_intent',
      identifier: `${user.id}:${ip}`,
      maxAttempts: 20,
      windowMinutes: 15,
    });
    if (!allowed) {
      return { success: false, error: 'Too many payment attempts. Please try again later.' };
    }

    const { fulfillmentMethod, items } = parsed.data;
    const uniqueIds = [...new Set(items.map((item) => item.productId))];

    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price, name')
      .in('id', uniqueIds)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (priceError) {
      logServerError('createPaymentIntentAction.prices', priceError);
      return { success: false, error: toUserError(priceError) };
    }

    const validated = validateOrderItems(items, dbProducts ?? []);
    if (!validated.ok) {
      return { success: false, error: validated.error };
    }

    const totals = calculateOrderTotals(
      validated.subtotal,
      fulfillmentMethod,
      validated.items.length,
    );
    const amount = toStripeAmount(totals.total);
    const cartFingerprint = buildCartFingerprint(validated.items, fulfillmentMethod);

    if (amount < 50) {
      return { success: false, error: 'Order total must be at least €0.50' };
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
      ...(isValidReceiptEmail(profile?.email) ? { receipt_email: profile.email } : {}),
      metadata: {
        user_id: user.id,
        fulfillment_method: fulfillmentMethod,
        cart_fingerprint: cartFingerprint,
        item_count: String(validated.items.length),
        subtotal: totals.subtotal.toFixed(2),
        shipping: totals.shipping.toFixed(2),
        vat: totals.vat.toFixed(2),
        total: totals.total.toFixed(2),
      },
    });

    if (!paymentIntent.client_secret) {
      return { success: false, error: 'Failed to initialize payment' };
    }

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totals.total,
      },
    };
  } catch (error) {
    logServerError('createPaymentIntentAction', error);
    return {
      success: false,
      error: toUserError(error),
    };
  }
}

export async function verifyStripePaymentIntent(
  paymentIntentId: string,
  expectedTotal: number,
  userId: string,
  cartFingerprint: string,
): Promise<{ ok: true; reference: string } | { ok: false; error: string }> {
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (
      intent.status !== 'succeeded' &&
      intent.status !== 'processing' &&
      intent.status !== 'requires_capture'
    ) {
      return { ok: false, error: 'Payment is not complete. Please try again.' };
    }

    if (intent.metadata.user_id !== userId) {
      return { ok: false, error: 'Payment does not belong to this account' };
    }

    if (intent.metadata.cart_fingerprint !== cartFingerprint) {
      return {
        ok: false,
        error: 'Payment does not match the current cart. Please pay again.',
      };
    }

    const expectedAmount = toStripeAmount(expectedTotal);
    const chargedAmount =
      intent.status === 'succeeded' ? intent.amount_received : intent.amount;

    if (chargedAmount < expectedAmount) {
      return { ok: false, error: 'Payment amount does not match order total' };
    }

    return { ok: true, reference: intent.id };
  } catch (error) {
    logServerError('verifyStripePaymentIntent', error);
    return {
      ok: false,
      error: toUserError(error),
    };
  }
}
