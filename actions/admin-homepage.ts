'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/server-session';
import type { HomepageSectionKey } from '@/types/cms';
import { sanitizeCmsLinks } from '@/lib/security/safe-href';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const sectionKeySchema = z.enum(['hero', 'about', 'services', 'why_choose', 'contact', 'footer']);

export async function getHomepageSectionsAction() {
  try {
    const { supabase } = await requirePermission('homepage:manage');
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('section_key');

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load homepage',
    };
  }
}

export async function updateHomepageSectionAction(
  sectionKey: HomepageSectionKey,
  content: unknown,
  isEnabled = true,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('homepage:manage');
    const keyParsed = sectionKeySchema.safeParse(sectionKey);
    if (!keyParsed.success) return { success: false, error: 'Invalid section' };

    const contentParsed = z.record(z.string(), z.unknown()).safeParse(content);
    if (!contentParsed.success) return { success: false, error: 'Invalid content' };

    const { error } = await supabase.from('homepage_sections').upsert({
      section_key: sectionKey,
      content: sanitizeCmsLinks(contentParsed.data),
      is_enabled: isEnabled,
      updated_at: new Date().toISOString(),
      updated_by: user!.id,
    });

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/homepage');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save section',
    };
  }
}
