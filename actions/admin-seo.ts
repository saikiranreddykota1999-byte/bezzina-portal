'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/server-session';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const seoPageSchema = z.object({
  id: z.string().uuid().optional(),
  path: z.string().trim().min(1).max(256),
  page_title: z.string().trim().min(1).max(256),
  meta_description: z.string().trim().max(500).optional(),
  keywords: z.string().trim().max(500).optional(),
  og_image_url: z.string().trim().url().optional().or(z.literal('')),
  canonical_url: z.string().trim().url().optional().or(z.literal('')),
  robots: z.string().trim().max(64).default('index,follow'),
});

export async function getSeoPagesAction() {
  try {
    const { supabase } = await requirePermission('seo:manage');
    const { data, error } = await supabase.from('seo_pages').select('*').order('path');
    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load SEO pages',
    };
  }
}

export async function upsertSeoPageAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await requirePermission('seo:manage');
    const parsed = seoPageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const payload = {
      path: parsed.data.path.startsWith('/') ? parsed.data.path : `/${parsed.data.path}`,
      page_title: parsed.data.page_title,
      meta_description: parsed.data.meta_description ?? null,
      keywords: parsed.data.keywords ?? null,
      og_image_url: parsed.data.og_image_url || null,
      canonical_url: parsed.data.canonical_url || null,
      robots: parsed.data.robots,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.id) {
      const { error } = await supabase.from('seo_pages').update(payload).eq('id', parsed.data.id);
      if (error) return { success: false, error: error.message };
      revalidatePath('/admin/seo');
      return { success: true, data: { id: parsed.data.id } };
    }

    const { data, error } = await supabase.from('seo_pages').insert(payload).select('id').single();
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/seo');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save SEO page',
    };
  }
}

export async function deleteSeoPageAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('seo:manage');
    const { error } = await supabase.from('seo_pages').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/seo');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete SEO page',
    };
  }
}
