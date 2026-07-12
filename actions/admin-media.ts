'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/server-session';
import type { MediaAsset } from '@/types/admin';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
];

export async function getMediaAssetsAction(folder?: string): Promise<ActionResult<MediaAsset[]>> {
  try {
    const { supabase } = await requirePermission('media:manage');
    let query = supabase.from('media_assets').select('*').order('created_at', { ascending: false });
    if (folder) query = query.eq('folder', folder);
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
    const folder = String(formData.get('folder') ?? 'general').trim() || 'general';
    const altText = String(formData.get('altText') ?? '').trim() || null;

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No file provided' };
    }
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, error: 'File must be under 15 MB' };
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return { success: false, error: 'File type not allowed' };
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('media-library')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('media-library').getPublicUrl(path);

    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        folder,
        file_name: file.name,
        url: urlData.publicUrl,
        mime_type: file.type,
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
  try {
    const { supabase } = await requirePermission('media:manage');
    const { data: asset } = await supabase.from('media_assets').select('url').eq('id', id).maybeSingle();
    const { error } = await supabase.from('media_assets').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    if (asset?.url) {
      const marker = '/media-library/';
      const index = asset.url.indexOf(marker);
      if (index !== -1) {
        const storagePath = asset.url.slice(index + marker.length);
        await supabase.storage.from('media-library').remove([storagePath]);
      }
    }

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
  try {
    const { supabase } = await requirePermission('media:manage');
    const { data: assets } = await supabase.from('media_assets').select('url').in('id', ids);
    const { error } = await supabase.from('media_assets').delete().in('id', ids);
    if (error) return { success: false, error: error.message };

    const storagePaths = (assets ?? [])
      .map((asset) => {
        const marker = '/media-library/';
        const index = asset.url.indexOf(marker);
        return index === -1 ? null : asset.url.slice(index + marker.length);
      })
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      await supabase.storage.from('media-library').remove(storagePaths);
    }

    revalidatePath('/admin/media');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed',
    };
  }
}
