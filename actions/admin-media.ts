'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import type { MediaAsset } from '@/types/admin';
import { parseBulkIds, productIdSchema } from '@/lib/security/bulk-ids';
import { softDeletePayload } from '@/lib/security/soft-delete';
import {
  sanitizeFolderName,
  sanitizeUploadFileName,
  validateUploadFile,
} from '@/lib/security/upload-validation';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getMediaAssetsAction(folder?: string): Promise<ActionResult<MediaAsset[]>> {
  try {
    const { supabase } = await requirePermission('media:manage');
    let query = supabase
      .from('media_assets')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (folder) query = query.eq('folder', sanitizeFolderName(folder));
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as MediaAsset[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load media',
    };
  }
}

export async function uploadMediaAssetAction(formData: FormData): Promise<ActionResult<MediaAsset>> {
  try {
    const { supabase, user } = await requirePermission('media:manage');
    const file = formData.get('file');
    const folder = sanitizeFolderName(String(formData.get('folder') ?? 'general'));
    const altText = String(formData.get('altText') ?? '').trim() || null;

    if (!(file instanceof File)) {
      return { success: false, error: 'No file provided' };
    }

    const validation = validateUploadFile(file, 'media');
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const safeName = sanitizeUploadFileName(file.name);
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('media-library')
      .upload(path, file, { contentType: validation.contentType, upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('media-library').getPublicUrl(path);

    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        folder,
        file_name: file.name,
        url: urlData.publicUrl,
        mime_type: validation.contentType,
        file_size: file.size,
        alt_text: altText,
        created_by: user!.id,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/media');
    return { success: true, data: data as MediaAsset };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function deleteMediaAssetAction(id: string): Promise<ActionResult> {
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: 'Invalid media id' };
  }

  try {
    const { supabase } = await requirePermission('media:manage');
    const { error } = await supabase
      .from('media_assets')
      .update(softDeletePayload())
      .eq('id', idParsed.data)
      .is('deleted_at', null);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/media');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

export async function bulkDeleteMediaAction(ids: string[]): Promise<ActionResult> {
  const idsParsed = parseBulkIds(ids);
  if (!idsParsed.success) {
    return { success: false, error: idsParsed.error.issues[0]?.message ?? 'Invalid selection' };
  }

  try {
    const { supabase } = await requirePermission('media:manage');
    const { error } = await supabase
      .from('media_assets')
      .update(softDeletePayload())
      .in('id', idsParsed.data)
      .is('deleted_at', null);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/media');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed',
    };
  }
}
