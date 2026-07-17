'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import type { ActionResult } from '@/types/action';
import type { ProductRelationType } from '@/types/product';

export type RelationProductPick = {
  id: string;
  sku: string;
  name: string;
  slug: string;
};

export type RelationProductSummary = {
  id: string;
  sku: string;
  name: string;
};

export type ProductRelationsBundle = {
  related: RelationProductSummary[];
  accessory: RelationProductSummary[];
  fbt: RelationProductSummary[];
};

const RELATION_TYPES: ProductRelationType[] = ['related', 'accessory', 'fbt'];

function isRelationType(value: string): value is ProductRelationType {
  return RELATION_TYPES.includes(value as ProductRelationType);
}

async function fetchProductSummaries(
  supabase: Awaited<ReturnType<typeof requirePermission>>['supabase'],
  ids: string[],
): Promise<RelationProductSummary[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select('id, sku, name')
    .in('id', ids)
    .is('deleted_at', null);

  if (error || !data) return [];

  const byId = new Map(data.map((row) => [row.id as string, row as RelationProductSummary]));
  return ids.map((id) => byId.get(id)).filter((p): p is RelationProductSummary => Boolean(p));
}

export async function getAdminProductRelationIds(
  productId: string,
  relationType: ProductRelationType,
): Promise<ActionResult<string[]>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { data, error } = await supabase
      .from('product_relations')
      .select('related_product_id')
      .eq('product_id', productId)
      .eq('relation_type', relationType)
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data ?? []).map((row) => row.related_product_id as string),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load relation IDs',
    };
  }
}

export async function getAdminProductRelationsBundle(
  productId: string,
): Promise<ActionResult<ProductRelationsBundle>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { data: rows, error } = await supabase
      .from('product_relations')
      .select('related_product_id, relation_type, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };

    const grouped: Record<ProductRelationType, string[]> = {
      related: [],
      accessory: [],
      fbt: [],
    };

    for (const row of rows ?? []) {
      const type = row.relation_type as string;
      if (isRelationType(type)) {
        grouped[type].push(row.related_product_id as string);
      }
    }

    const allIds = [...new Set([...grouped.related, ...grouped.accessory, ...grouped.fbt])];
    const summaries = await fetchProductSummaries(supabase, allIds);
    const byId = new Map(summaries.map((p) => [p.id, p]));

    const mapIds = (ids: string[]) =>
      ids.map((id) => byId.get(id)).filter((p): p is RelationProductSummary => Boolean(p));

    return {
      success: true,
      data: {
        related: mapIds(grouped.related),
        accessory: mapIds(grouped.accessory),
        fbt: mapIds(grouped.fbt),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load relations',
    };
  }
}

export async function replaceProductRelations(
  productId: string,
  relationType: ProductRelationType,
  relatedProductIds: string[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');

    const uniqueIds = [...new Set(relatedProductIds.filter((id) => id && id !== productId))];

    const { error: deleteError } = await supabase
      .from('product_relations')
      .delete()
      .eq('product_id', productId)
      .eq('relation_type', relationType);

    if (deleteError) return { success: false, error: deleteError.message };

    if (uniqueIds.length > 0) {
      const { error: insertError } = await supabase.from('product_relations').insert(
        uniqueIds.map((relatedProductId, index) => ({
          product_id: productId,
          related_product_id: relatedProductId,
          relation_type: relationType,
          sort_order: index,
        })),
      );

      if (insertError) return { success: false, error: insertError.message };
    }

    if (relationType === 'related') {
      const { error: updateError } = await supabase
        .from('products')
        .update({ related_product_ids: uniqueIds.length > 0 ? uniqueIds : null })
        .eq('id', productId);

      if (updateError) return { success: false, error: updateError.message };
    }

    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save relations',
    };
  }
}

export async function searchProductsForRelationAction(
  query: string,
): Promise<ActionResult<RelationProductPick[]>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { success: true, data: [] };
    }

    const pattern = `%${trimmed}%`;
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name, slug')
      .is('deleted_at', null)
      .or(`name.ilike.${pattern},sku.ilike.${pattern}`)
      .order('name', { ascending: true })
      .limit(20);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as RelationProductPick[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}
