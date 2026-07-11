'use server';

import { quickSearchProducts, type ProductSearchHit } from '@/lib/product-search';
import { getCataloguePageData } from '@/services/product.service';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function quickSearchProductsAction(
  query: string,
): Promise<ActionResult<ProductSearchHit[]>> {
  try {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { success: true, data: [] };
    }

    const { products, error } = await getCataloguePageData();
    if (error) {
      return { success: false, error: error };
    }

    return { success: true, data: quickSearchProducts(products, trimmed, 6) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Search failed',
    };
  }
}
