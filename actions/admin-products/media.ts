'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { productVariantSchema, productDocumentSchema } from '@/lib/validators/catalogue';
import type { ProductDocument, ProductVariant } from '@/types/product';
import type { ActionResult } from '@/types/action';
import { validateUploadFile, sanitizeUploadFileName } from '@/lib/security/upload-validation';

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

    const fileCheck = await validateUploadFile(file, 'image');
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();

    if (!product) return { success: false, error: 'Product not found' };

    const safeName = sanitizeUploadFileName(file.name);
    const path = `${product.slug}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: fileCheck.contentType, upsert: false });

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

export async function uploadProduct360Frame(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No file provided' };
    }

    const fileCheck = await validateUploadFile(file, 'image');
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();

    if (!product) return { success: false, error: 'Product not found' };

    const safeName = sanitizeUploadFileName(file.name);
    const path = `${product.slug}/360/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: fileCheck.contentType, upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    const url = urlData.publicUrl;

    const { count } = await supabase
      .from('product_360_frames')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    await supabase.from('product_360_frames').insert({
      product_id: productId,
      url,
      thumbnail_url: url,
      sort_order: count ?? 0,
    });

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: { url } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function reorderProduct360Frames(
  productId: string,
  frameIds: string[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    await Promise.all(
      frameIds.map((id, index) =>
        supabase
          .from('product_360_frames')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('product_id', productId),
      ),
    );
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Reorder failed' };
  }
}

export async function deleteProduct360Frame(
  productId: string,
  frameId: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('products:manage');
    const { error } = await supabase
      .from('product_360_frames')
      .delete()
      .eq('id', frameId)
      .eq('product_id', productId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
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

    const fileCheck = await validateUploadFile(file, 'document');
    if (!fileCheck.valid) return { success: false, error: fileCheck.error };

    const { data: product } = await supabase.from('products').select('slug').eq('id', productId).single();
    if (!product) return { success: false, error: 'Product not found' };

    const safeName = sanitizeUploadFileName(file.name);
    const path = `${product.slug}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('product-documents')
      .upload(path, file, { contentType: fileCheck.contentType, upsert: false });
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
