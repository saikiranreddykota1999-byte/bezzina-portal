import { describe, expect, it } from 'vitest';
import { checkCatalogueStock } from '@/lib/checkout/stock';

describe('checkCatalogueStock', () => {
  it('accepts available stock', () => {
    const result = checkCatalogueStock(
      [{ productId: 'p1', quantity: 2 }],
      [{ id: 'p1', name: 'Bolt', in_stock: true, stock_quantity: 10 }],
    );
    expect(result.ok).toBe(true);
  });

  it('rejects out of stock and insufficient quantity', () => {
    expect(
      checkCatalogueStock(
        [{ productId: 'p1', quantity: 1 }],
        [{ id: 'p1', name: 'Bolt', in_stock: false, stock_quantity: 5 }],
      ).ok,
    ).toBe(false);

    expect(
      checkCatalogueStock(
        [{ productId: 'p1', quantity: 6 }],
        [{ id: 'p1', name: 'Bolt', in_stock: true, stock_quantity: 5 }],
      ).ok,
    ).toBe(false);
  });
});
