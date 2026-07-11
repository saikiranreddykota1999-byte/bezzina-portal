import { describe, expect, it } from 'vitest';
import {
  calculateOrderTotals,
  calculateShippingCost,
  formatPickupAddress,
} from '@/lib/checkout';

describe('checkout helpers', () => {
  it('charges delivery shipping only for delivery orders', () => {
    expect(calculateShippingCost('delivery', 2)).toBe(12.5);
    expect(calculateShippingCost('store_pickup', 2)).toBe(0);
    expect(calculateShippingCost('delivery', 0)).toBe(0);
  });

  it('calculates totals with free pickup shipping', () => {
    expect(calculateOrderTotals(100, 'store_pickup', 1)).toEqual({
      subtotal: 100,
      shipping: 0,
      total: 100,
    });
  });

  it('formats pickup addresses', () => {
    expect(
      formatPickupAddress({
        line1: '5/6 Triq Aldo Moro',
        city: 'Il-Marsa',
        postal_code: 'MRS 9065',
        country: 'Malta',
      }),
    ).toContain('Il-Marsa');
  });
});
