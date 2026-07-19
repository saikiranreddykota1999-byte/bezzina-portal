/**
 * Shared Stripe PaymentIntent → order payment_status mapping.
 * Only `succeeded` means money collected / order paid.
 */

export type OrderPaymentStatus = 'paid' | 'processing' | 'pending' | 'failed' | 'refunded';

export function isPaymentIntentSucceeded(status: string): boolean {
  return status === 'succeeded';
}

export type ResolveIntentPaymentResult =
  | { ok: true; paymentStatus: 'paid' | 'processing' }
  | { ok: false; error: string };

/**
 * Maps a PaymentIntent status to an order payment_status.
 * - succeeded → paid (fulfillable once order rules allow)
 * - processing → processing (not paid, not fulfillable)
 * - requires_capture → rejected (manual capture is not an automatic paid path)
 */
export function resolveOrderPaymentStatusFromIntent(
  status: string,
): ResolveIntentPaymentResult {
  if (status === 'succeeded') {
    return { ok: true, paymentStatus: 'paid' };
  }

  if (status === 'processing') {
    return { ok: true, paymentStatus: 'processing' };
  }

  if (status === 'requires_capture') {
    return {
      ok: false,
      error:
        'Payment is authorized but not captured. This checkout does not support manual capture.',
    };
  }

  return { ok: false, error: 'Payment is not complete. Please try again.' };
}
