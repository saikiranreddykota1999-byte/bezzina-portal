'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import type { ActionResult } from '@/types/action';
import { logActivity } from '@/services/activity-log.service';
import { parseBulkIds } from '@/lib/security/bulk-ids';
import { productSoftDeletePayload } from '@/lib/security/soft-delete';

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult> {
  const idsParsed = parseBulkIds(ids);
  if (!idsParsed.success) {
    return { success: false, error: idsParsed.error.issues[0]?.message ?? 'Invalid selection' };
  }

  try {
    const { supabase, user } = await requirePermission('products:manage');
    const validIds = idsParsed.data;

    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, sku, slug')
      .in('id', validIds)
      .is('deleted_at', null);

    if (fetchError) return { success: false, error: fetchError.message };
    if (!products?.length) return { success: false, error: 'No products found' };

    const { error } = await supabase
      .from('products')
      .update(productSoftDeletePayload())
      .in('id', products.map((product) => product.id));
    if (error) return { success: false, error: error.message };

    await logActivity({
      userId: user?.id ?? null,
      action: 'product.bulk_delete',
      entity: 'product',
      newValue: { count: products.length, ids },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed',
    };
  }
}

export async function bulkArchiveProducts(ids: string[]): Promise<ActionResult> {
  const idsParsed = parseBulkIds(ids);
  if (!idsParsed.success) {
    return { success: false, error: idsParsed.error.issues[0]?.message ?? 'Invalid selection' };
  }

  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .in('id', idsParsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk archive failed',
    };
  }
}

export async function bulkPublishProducts(ids: string[]): Promise<ActionResult> {
  const idsParsed = parseBulkIds(ids);
  if (!idsParsed.success) {
    return { success: false, error: idsParsed.error.issues[0]?.message ?? 'Invalid selection' };
  }

  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update({ publish_status: 'published', is_active: true, deleted_at: null })
      .in('id', idsParsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk publish failed',
    };
  }
}
