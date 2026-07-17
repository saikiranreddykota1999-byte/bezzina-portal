'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { productFormSchema } from '@/lib/validators/catalogue';
import type { Product } from '@/types/product';
import type { ActionResult } from '@/types/action';
import { getAdminCategoryTree, type CategoryTree } from '@/actions/admin-categories';
import { logActivity } from '@/services/activity-log.service';
import { productIdSchema } from '@/lib/security/bulk-ids';
import { productSoftDeletePayload } from '@/lib/security/soft-delete';
import { toProductWritePayload } from '@/lib/admin/product-payload';

export async function deleteProduct(id: string): Promise<ActionResult> {
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: 'Invalid product id' };
  }

  try {
    const { supabase, user } = await requirePermission('products:manage');

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, sku, slug')
      .eq('id', idParsed.data)
      .is('deleted_at', null)
      .single();

    if (fetchError || !product) {
      return { success: false, error: 'Product not found' };
    }

    const { error } = await supabase
      .from('products')
      .update(productSoftDeletePayload())
      .eq('id', idParsed.data);
    if (error) return { success: false, error: error.message };

    await logActivity({
      userId: user?.id ?? null,
      action: 'product.delete',
      entity: 'product',
      entityId: id,
      oldValue: { name: product.name, sku: product.sku, slug: product.slug },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

export async function getAdminProducts(): Promise<ActionResult<Product[]>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Product[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load products',
    };
  }
}

export async function getAdminProduct(id: string): Promise<ActionResult<Product>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*), spin_frames:product_360_frames(*)')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Product not found',
    };
  }
}

export async function createProduct(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requirePermission('products:manage');
    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('products')
      .insert(toProductWritePayload(parsed.data, 'create'))
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    await logActivity({
      userId: user?.id ?? null,
      action: 'product.create',
      entity: 'product',
      entityId: data.id,
      newValue: { name: parsed.data.name, sku: parsed.data.sku },
    });
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('products:manage');
    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { data: existing } = await supabase.from('products').select('name, sku').eq('id', id).single();

    const { error } = await supabase
      .from('products')
      .update(toProductWritePayload(parsed.data, 'update'))
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    await logActivity({
      userId: user?.id ?? null,
      action: 'product.update',
      entity: 'product',
      entityId: id,
      oldValue: existing ? { name: existing.name, sku: existing.sku } : null,
      newValue: { name: parsed.data.name, sku: parsed.data.sku },
    });
    revalidatePath('/admin/products');
    revalidatePath(`/products/${parsed.data.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: 'Invalid product id' };
  }

  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update(productSoftDeletePayload())
      .eq('id', idParsed.data)
      .is('deleted_at', null);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive product',
    };
  }
}

export async function getAdminCategories() {
  const result = await getAdminCategoryTree();
  if (!result.success) return result;
  return { success: true as const, data: result.data?.subcategories ?? [] };
}

export async function getAdminCategoryOptions(): Promise<ActionResult<CategoryTree>> {
  return getAdminCategoryTree();
}

export async function restoreProduct(id: string): Promise<ActionResult> {
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: 'Invalid product id' };
  }

  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update({ is_active: true, deleted_at: null })
      .eq('id', idParsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restore product',
    };
  }
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { data: source, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !source) return { success: false, error: 'Product not found' };

    const copySlug = `${source.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    const rest = { ...(source as Record<string, unknown>) };
    delete rest.id;
    delete rest.created_at;

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...rest,
        name: `${source.name} (Copy)`,
        sku: `${source.sku}-COPY`,
        slug: copySlug,
        publish_status: 'draft',
        is_active: true,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/products');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate product',
    };
  }
}
