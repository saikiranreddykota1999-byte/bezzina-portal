'use server';

import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { calculateOrderTotals } from '@/lib/checkout';
import { DEFAULT_PRODUCT_PRICE, resolveQuoteLinePrice } from '@/lib/pricing';
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

    const { supabase, user, profile } = await requireAuthenticatedUser();
    const { fulfillmentMethod, items } = parsed.data;

    const productIds = items.map((item) => item.productId);
    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price, name')
      .in('id', productIds);

    if (priceError) {
      return { success: false, error: priceError.message };
    }

    if ((dbProducts ?? []).length !== productIds.length) {
      return { success: false, error: 'One or more products are no longer available' };
    }

    const priceMap = new Map(
      (dbProducts ?? []).map((product) => [product.id, resolveQuoteLinePrice(product.price)]),
    );

    const validatedItems = items.map((item) => ({
      ...item,
      price: priceMap.get(item.productId) ?? DEFAULT_PRODUCT_PRICE,
    }));

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totals = calculateOrderTotals(subtotal, fulfillmentMethod, validatedItems.length);
    const amount = toStripeAmount(totals.total);

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
        user_id: user!.id,
        fulfillment_method: fulfillmentMethod,
        item_count: String(validatedItems.length),
        subtotal: totals.subtotal.toFixed(2),
        shipping: totals.shipping.toFixed(2),
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

export async function verifyStripePaymentIntent(
  paymentIntentId: string,
  expectedTotal: number,
  userId: string,
): Promise<{ ok: true; reference: string } | { ok: false; error: string }> {
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (
      intent.status !== 'succeeded' &&
      intent.status !== 'processing' &&
      intent.status !== 'requires_capture'
    ) {
      return { ok: false, error: `Payment status: ${intent.status}. Please try again.` };
    }

    if (intent.metadata.user_id !== userId) {
      return { ok: false, error: 'Payment does not belong to this account' };
    }

    const expectedAmount = toStripeAmount(expectedTotal);
    const chargedAmount =
      intent.status === 'succeeded' ? intent.amount_received : intent.amount;

    if (chargedAmount < expectedAmount) {
      return { ok: false, error: 'Payment amount does not match order total' };
    }

    return { ok: true, reference: intent.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}
