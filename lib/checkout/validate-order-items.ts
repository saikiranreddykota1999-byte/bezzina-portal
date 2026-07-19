import { resolveProductPrice } from '@/lib/pricing';

export type ClientOrderItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  unit: string;
  quantity: number;
};

export type DbProductPriceRow = {
  id: string;
  price: number | null;
};

export type ValidatedOrderItem = ClientOrderItem & { price: number };

export type ValidateOrderItemsResult =
  | { ok: true; items: ValidatedOrderItem[]; subtotal: number }
  | { ok: false; error: string };

/**
 * Validates catalogue lines for checkout: active, not deleted, priced, and present.
 * Deduplicates product IDs against the DB result set.
 */
export function validateOrderItems(
  items: ClientOrderItem[],
  dbProducts: DbProductPriceRow[],
): ValidateOrderItemsResult {
  const uniqueIds = [...new Set(items.map((item) => item.productId))];

  if (dbProducts.length !== uniqueIds.length) {
    return { ok: false, error: 'One or more products are no longer available' };
  }

  const priceMap = new Map<string, number>();
  for (const product of dbProducts) {
    const price = resolveProductPrice(product.price);
    if (price == null || price <= 0) {
      return {
        ok: false,
        error: 'One or more products require a quote and cannot be purchased online',
      };
    }
    priceMap.set(product.id, price);
  }

  const validatedItems: ValidatedOrderItem[] = items.map((item) => {
    const price = priceMap.get(item.productId);
    if (price == null) {
      throw new Error('Missing validated price');
    }
    return { ...item, price };
  });

  const subtotal = validatedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (subtotal <= 0) {
    return { ok: false, error: 'Order total must be greater than zero' };
  }

  return { ok: true, items: validatedItems, subtotal };
}
