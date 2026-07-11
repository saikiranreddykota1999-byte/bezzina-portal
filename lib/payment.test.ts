import { describe, expect, it } from 'vitest';
import { detectCardBrand } from '@/lib/payment';

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
