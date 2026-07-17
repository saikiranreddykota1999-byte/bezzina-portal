'use server';

import type { ActionResult } from '@/types/action';
import { quickSearchProducts, type ProductSearchHit } from '@/lib/product-search';
import { searchProductsForQuery } from '@/services/product.service';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { getClientIp } from '@/lib/security/rate-limit';

export async function quickSearchProductsAction(
  query: string,
): Promise<ActionResult<ProductSearchHit[]>> {
  try {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { success: true, data: [] };
    }

    const ip = (await getClientIp()) ?? 'unknown';
    const allowed = await checkPublicRateLimit('product_search', ip, 60, 1);
    if (!allowed) {
      return { success: false, error: 'Too many search requests. Please try again shortly.' };
    }

    const { products, error } = await searchProductsForQuery(trimmed, 40);
    if (error) {
      return { success: false, error };
    }

    return { success: true, data: quickSearchProducts(products, trimmed, 6) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Search failed',
    };
  }
}
