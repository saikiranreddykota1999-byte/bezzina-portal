'use server';

import type { ActionResultWithData } from '@/types/action';
import type { Product } from '@/types/product';
import { getProductsByIds } from '@/services/product.service';

export async function getCompareProductsAction(
  ids: string[],
): Promise<ActionResultWithData<Product[]>> {
  try {
    const uniqueIds = [...new Set(ids.filter(Boolean))].slice(0, 4);
    if (uniqueIds.length === 0) {
      return { success: true, data: [] };
    }

    const products = await getProductsByIds(uniqueIds);
    return { success: true, data: products };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load compare products',
    };
  }
}
