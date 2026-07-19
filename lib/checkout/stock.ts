import type { SupabaseClient } from '@supabase/supabase-js';

export type StockLine = {
  productId: string;
  quantity: number;
  name?: string;
};

export type ProductStockRow = {
  id: string;
  name?: string | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
};

export type StockCheckResult =
  | { ok: true }
  | { ok: false; error: string };

/** Catalogue-level stock gate using products.in_stock / stock_quantity. */
export function checkCatalogueStock(
  items: StockLine[],
  products: ProductStockRow[],
): StockCheckResult {
  const byId = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { ok: false, error: 'One or more products are no longer available' };
    }

    if (product.in_stock === false) {
      return {
        ok: false,
        error: `${product.name ?? item.name ?? 'A product'} is currently out of stock`,
      };
    }

    const available = product.stock_quantity ?? 0;
    if (available < item.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${product.name ?? item.name ?? 'a product'} (available: ${available})`,
      };
    }
  }

  return { ok: true };
}

/**
 * Atomically decrements catalogue stock. Fails closed if any row cannot be updated.
 */
export async function decrementCatalogueStock(
  client: SupabaseClient,
  items: StockLine[],
): Promise<void> {
  for (const item of items) {
    const { data: current, error: readError } = await client
      .from('products')
      .select('id, stock_quantity, name')
      .eq('id', item.productId)
      .maybeSingle();

    if (readError) throw new Error(readError.message);
    if (!current) throw new Error(`Product ${item.productId} not found for stock update`);

    const available = current.stock_quantity ?? 0;
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for ${current.name ?? item.productId} (available: ${available})`,
      );
    }

    const nextQty = available - item.quantity;
    const { data: updated, error: updateError } = await client
      .from('products')
      .update({
        stock_quantity: nextQty,
        in_stock: nextQty > 0,
      })
      .eq('id', item.productId)
      .gte('stock_quantity', item.quantity)
      .select('id')
      .maybeSingle();

    if (updateError) throw new Error(updateError.message);
    if (!updated) {
      throw new Error(`Stock changed for ${current.name ?? item.productId}. Please retry.`);
    }
  }
}

export async function restoreCatalogueStock(
  client: SupabaseClient,
  items: StockLine[],
): Promise<void> {
  for (const item of items) {
    const { data: current } = await client
      .from('products')
      .select('id, stock_quantity')
      .eq('id', item.productId)
      .maybeSingle();

    if (!current) continue;

    const nextQty = (current.stock_quantity ?? 0) + item.quantity;
    await client
      .from('products')
      .update({
        stock_quantity: nextQty,
        in_stock: nextQty > 0,
      })
      .eq('id', item.productId);
  }
}
