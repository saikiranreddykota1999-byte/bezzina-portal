'use server';

import { revalidatePath } from 'next/cache';
import { requireStaffUser } from '@/lib/auth/server-session';
import { productFormSchema } from '@/lib/validators/catalogue';
import type { Product } from '@/types/product';
import { getAdminCategoryTree, type CategoryTree } from '@/actions/admin-categories';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getAdminProducts(): Promise<ActionResult<Product[]>> {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
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
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
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
    const { supabase } = await requireStaffUser();
    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...parsed.data,
        description: parsed.data.description ?? null,
        price: parsed.data.price ?? null,
        material: parsed.data.material ?? null,
        standard: parsed.data.standard ?? null,
        featured: false,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
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
    const { supabase } = await requireStaffUser();
    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        ...parsed.data,
        description: parsed.data.description ?? null,
        price: parsed.data.price ?? null,
        material: parsed.data.material ?? null,
        standard: parsed.data.standard ?? null,
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
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
  try {
    const { supabase } = await requireStaffUser();
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

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

export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { supabase } = await requireStaffUser();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No file provided' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File must be under 5 MB' };
    }

    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();

    if (!product) return { success: false, error: 'Product not found' };

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${product.slug}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    const url = urlData.publicUrl;

    const { data: existing } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    const isPrimary = (existing ?? []).length === 0;

    await supabase.from('product_images').insert({
      product_id: productId,
      url,
      thumbnail_url: url,
      is_primary: isPrimary,
      sort_order: (existing ?? []).length,
    });

    if (isPrimary) {
      await supabase.from('products').update({ image_url: url }).eq('id', productId);
    }

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: { url } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
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
