import { describe, expect, it } from 'vitest';
import { validateOrderItems } from '@/lib/checkout/validate-order-items';
import { buildCartFingerprint } from '@/lib/checkout/cart-fingerprint';

const baseItem = {
  productId: 'p1',
  slug: 'bolt',
  name: 'Bolt',
  sku: 'B-1',
  price: 2,
  unit: 'pcs',
  quantity: 2,
};

describe('validateOrderItems', () => {
  it('accepts active priced products', () => {
    const result = validateOrderItems([baseItem], [{ id: 'p1', price: 2.5 }]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0]?.price).toBe(2.5);
      expect(result.subtotal).toBe(5);
    }
  });

  it('rejects null or zero catalogue prices', () => {
    expect(validateOrderItems([baseItem], [{ id: 'p1', price: null }]).ok).toBe(false);
    expect(validateOrderItems([baseItem], [{ id: 'p1', price: 0 }]).ok).toBe(false);
  });

  it('rejects missing catalogue rows', () => {
    expect(validateOrderItems([baseItem], []).ok).toBe(false);
  });
});

describe('buildCartFingerprint', () => {
  it('is stable regardless of line order', () => {
    const a = buildCartFingerprint(
      [
        { productId: 'a', quantity: 1, price: 1 },
        { productId: 'b', quantity: 2, price: 3 },
      ],
      'delivery',
    );
    const b = buildCartFingerprint(
      [
        { productId: 'b', quantity: 2, price: 3 },
        { productId: 'a', quantity: 1, price: 1 },
      ],
      'delivery',
    );
    expect(a).toBe(b);
  });

  it('changes when quantity or fulfillment changes', () => {
    const base = buildCartFingerprint(
      [{ productId: 'a', quantity: 1, price: 1 }],
      'delivery',
    );
    const qty = buildCartFingerprint(
      [{ productId: 'a', quantity: 2, price: 1 }],
      'delivery',
    );
    const method = buildCartFingerprint(
      [{ productId: 'a', quantity: 1, price: 1 }],
      'store_pickup',
    );
    expect(base).not.toBe(qty);
    expect(base).not.toBe(method);
  });
});
