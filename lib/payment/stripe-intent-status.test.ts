import { describe, expect, it } from 'vitest';
import {
  isPaymentIntentSucceeded,
  resolveOrderPaymentStatusFromIntent,
} from '@/lib/payment/stripe-intent-status';

describe('isPaymentIntentSucceeded', () => {
  it('returns true only for succeeded', () => {
    expect(isPaymentIntentSucceeded('succeeded')).toBe(true);
    expect(isPaymentIntentSucceeded('processing')).toBe(false);
    expect(isPaymentIntentSucceeded('requires_capture')).toBe(false);
  });
});

describe('resolveOrderPaymentStatusFromIntent', () => {
  it('maps succeeded to paid', () => {
    expect(resolveOrderPaymentStatusFromIntent('succeeded')).toEqual({
      ok: true,
      paymentStatus: 'paid',
    });
  });

  it('maps processing to processing (not paid)', () => {
    expect(resolveOrderPaymentStatusFromIntent('processing')).toEqual({
      ok: true,
      paymentStatus: 'processing',
    });
  });

  it('rejects requires_capture', () => {
    const result = resolveOrderPaymentStatusFromIntent('requires_capture');
    expect(result.ok).toBe(false);
  });
});
