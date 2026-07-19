import { describe, expect, it } from 'vitest';
import { detectCardBrand, isDemoPaymentAllowed } from '@/lib/payment';

describe('isDemoPaymentAllowed', () => {
  it('blocks demo payment when Stripe is enabled', () => {
    expect(isDemoPaymentAllowed(true, 'development')).toBe(false);
  });

  it('allows demo payment in non-production when Stripe is disabled', () => {
    expect(isDemoPaymentAllowed(false, 'development')).toBe(true);
    expect(isDemoPaymentAllowed(false, 'test')).toBe(true);
  });

  it('blocks demo payment in production even when Stripe is disabled', () => {
    expect(isDemoPaymentAllowed(false, 'production')).toBe(false);
  });
});

describe('detectCardBrand', () => {
  it('detects common card brands from prefixes', () => {
    expect(detectCardBrand('4111 1111 1111 1111')).toBe('visa');
    expect(detectCardBrand('5123 4567 8901 2345')).toBe('mastercard');
    expect(detectCardBrand('3714 496353 98431')).toBe('amex');
  });

  it('returns other for unknown prefixes', () => {
    expect(detectCardBrand('6011')).toBe('other');
  });
});
