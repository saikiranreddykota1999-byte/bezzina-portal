'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { productFormSchema, productVariantSchema, productDocumentSchema } from '@/lib/validators/catalogue';
import type { Product, ProductDocument, ProductVariant } from '@/types/product';
import { getAdminCategoryTree, type CategoryTree } from '@/actions/admin-categories';
import { logActivity } from '@/services/activity-log.service';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

async function removeProductStorageAssets(
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  productId: string,
) {
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId);

  const imagePaths = (images ?? [])
    .map((image) => storagePathFromPublicUrl(image.url, 'product-images'))
    .filter((path): path is string => Boolean(path));

  if (imagePaths.length > 0) {
    await supabase.storage.from('product-images').remove(imagePaths);
  }

  const { data: documents } = await supabase
    .from('product_documents')
    .select('url')
    .eq('product_id', productId);

  const documentPaths = (documents ?? [])
    .map((document) => storagePathFromPublicUrl(document.url, 'product-documents'))
    .filter((path): path is string => Boolean(path));

  if (documentPaths.length > 0) {
    await supabase.storage.from('product-documents').remove(documentPaths);
  }
}

async function detachProductReferences(
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  productId: string,
) {
  await supabase.from('order_items').update({ product_id: null }).eq('product_id', productId);
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('products:manage');

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, sku, slug')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return { success: false, error: 'Product not found' };
    }

    await detachProductReferences(supabase, id);
    await removeProductStorageAssets(supabase, id);

    const { error } = await supabase.from('products').delete().eq('id', id);
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

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult> {
  if (ids.length === 0) {
    return { success: false, error: 'No products selected' };
  }

  try {
    const { supabase, user } = await requirePermission('products:manage');

    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, sku, slug')
      .in('id', ids);

    if (fetchError) return { success: false, error: fetchError.message };
    if (!products?.length) return { success: false, error: 'No products found' };

    for (const product of products) {
      await detachProductReferences(supabase, product.id);
      await removeProductStorageAssets(supabase, product.id);
    }

    const { error } = await supabase.from('products').delete().in('id', ids);
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

export async function getAdminProducts(): Promise<ActionResult<Product[]>> {
  try {
    const { supabase } = await requirePermission('products:manage');
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
    const { supabase } = await requirePermission('products:manage');
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*)')
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
      .insert({
        ...parsed.data,
        description: parsed.data.description ?? null,
        long_description: parsed.data.long_description ?? null,
        applications: parsed.data.applications ?? null,
        price: parsed.data.price ?? null,
        material: parsed.data.material ?? null,
        standard: parsed.data.standard ?? null,
        thread_type: parsed.data.thread_type ?? null,
        grade: parsed.data.grade ?? null,
        length_mm: parsed.data.length_mm ?? null,
        diameter_mm: parsed.data.diameter_mm ?? null,
        weight_kg: parsed.data.weight_kg ?? null,
        video_url: parsed.data.video_url || null,
        youtube_url: parsed.data.youtube_url || null,
        technical_specs: parsed.data.technical_specs ?? [],
        availability: parsed.data.availability ?? 'available',
        search_keywords: parsed.data.search_keywords ?? null,
        internal_notes: parsed.data.internal_notes ?? null,
        seo_title: parsed.data.seo_title ?? null,
        seo_description: parsed.data.seo_description ?? null,
        tags: parsed.data.tags ?? null,
        discount_percent: parsed.data.discount_percent ?? null,
        featured: parsed.data.featured ?? false,
        fast_selling: parsed.data.fast_selling ?? false,
        upcoming: parsed.data.upcoming ?? false,
        future_product: parsed.data.future_product ?? false,
        new_arrival: parsed.data.new_arrival ?? false,
        clearance: parsed.data.clearance ?? false,
        recommended: parsed.data.recommended ?? false,
        marine_grade: parsed.data.marine_grade ?? false,
        industrial_grade: parsed.data.industrial_grade ?? false,
        best_seller: parsed.data.best_seller ?? false,
        most_viewed: parsed.data.most_viewed ?? false,
        recently_added: parsed.data.recently_added ?? false,
        publish_status: parsed.data.publish_status ?? 'published',
      })
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
      .update({
        ...parsed.data,
        description: parsed.data.description ?? null,
        long_description: parsed.data.long_description ?? null,
        applications: parsed.data.applications ?? null,
        price: parsed.data.price ?? null,
        material: parsed.data.material ?? null,
        standard: parsed.data.standard ?? null,
        thread_type: parsed.data.thread_type ?? null,
        grade: parsed.data.grade ?? null,
        length_mm: parsed.data.length_mm ?? null,
        diameter_mm: parsed.data.diameter_mm ?? null,
        weight_kg: parsed.data.weight_kg ?? null,
        video_url: parsed.data.video_url || null,
        youtube_url: parsed.data.youtube_url || null,
        technical_specs: parsed.data.technical_specs ?? [],
        availability: parsed.data.availability ?? 'available',
        search_keywords: parsed.data.search_keywords ?? null,
        internal_notes: parsed.data.internal_notes ?? null,
        seo_title: parsed.data.seo_title ?? null,
        seo_description: parsed.data.seo_description ?? null,
        tags: parsed.data.tags ?? null,
        discount_percent: parsed.data.discount_percent ?? null,
        featured: parsed.data.featured,
        fast_selling: parsed.data.fast_selling,
        upcoming: parsed.data.upcoming,
        future_product: parsed.data.future_product,
        new_arrival: parsed.data.new_arrival,
        clearance: parsed.data.clearance,
        recommended: parsed.data.recommended,
        marine_grade: parsed.data.marine_grade,
        industrial_grade: parsed.data.industrial_grade,
        best_seller: parsed.data.best_seller,
        most_viewed: parsed.data.most_viewed,
        recently_added: parsed.data.recently_added,
      })
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
  try {
    const { supabase } = await requirePermission('products:manage');
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
    const { supabase } = await requirePermission('products:manage');
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

export async function restoreProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', id);
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

export async function bulkArchiveProducts(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase.from('products').update({ is_active: false }).in('id', ids);
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
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('products')
      .update({ publish_status: 'published', is_active: true })
      .in('id', ids);
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

export async function reorderProductImages(
  productId: string,
  imageIds: string[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    await Promise.all(
      imageIds.map((id, index) =>
        supabase.from('product_images').update({ sort_order: index }).eq('id', id).eq('product_id', productId),
      ),
    );
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Reorder failed' };
  }
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    const { data: image } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('product_id', productId)
      .select('url')
      .single();

    if (image?.url) {
      await supabase.from('products').update({ image_url: image.url }).eq('id', productId);
    }
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to set primary' };
  }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase.from('product_images').delete().eq('id', imageId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

export async function uploadProductDocument(
  productId: string,
  formData: FormData,
): Promise<ActionResult<ProductDocument>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const file = formData.get('file');
    const meta = productDocumentSchema.safeParse({
      label: formData.get('label'),
      doc_type: formData.get('doc_type'),
    });
    if (!meta.success) return { success: false, error: meta.error.issues[0]?.message ?? 'Invalid metadata' };
    if (!(file instanceof File) || file.size === 0) return { success: false, error: 'No file provided' };
    if (file.size > 20 * 1024 * 1024) return { success: false, error: 'File must be under 20 MB' };

    const { data: product } = await supabase.from('products').select('slug').eq('id', productId).single();
    if (!product) return { success: false, error: 'Product not found' };

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${product.slug}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('product-documents')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('product-documents').getPublicUrl(path);
    const { count } = await supabase
      .from('product_documents')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    const { data, error } = await supabase
      .from('product_documents')
      .insert({
        product_id: productId,
        label: meta.data.label,
        doc_type: meta.data.doc_type,
        url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        sort_order: count ?? 0,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: data as ProductDocument };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function deleteProductDocument(docId: string, productId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase.from('product_documents').delete().eq('id', docId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

export async function saveProductVariants(
  productId: string,
  variants: unknown[],
): Promise<ActionResult<ProductVariant[]>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const parsed = variants.map((v) => productVariantSchema.parse(v));

    await supabase.from('product_variants').delete().eq('product_id', productId);

    if (parsed.length === 0) {
      revalidatePath(`/admin/products/${productId}`);
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('product_variants')
      .insert(
        parsed.map((v, i) => ({
          product_id: productId,
          name: v.name,
          sku: v.sku,
          availability: v.availability,
          unit: v.unit,
          weight_kg: v.weight_kg ?? null,
          specification: v.specification ?? null,
          image_url: v.image_url || null,
          document_url: v.document_url || null,
          document_label: v.document_label ?? null,
          in_stock: v.in_stock,
          stock_quantity: v.stock_quantity,
          price: v.price ?? null,
          sort_order: v.sort_order ?? i,
        })),
      )
      .select('*');

    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: (data ?? []) as ProductVariant[] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save variants' };
  }
}
