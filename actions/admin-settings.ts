'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSuperAdminUser } from '@/lib/auth/server-session';


type SettingsKey = 'company' | 'social' | 'business_hours';

export async function getSiteSettingsAction(key: SettingsKey) {
  try {
    const { supabase } = await requireSuperAdminUser();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: (data?.value as Record<string, unknown>) ?? {} };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load settings',
    };
  }
}

export async function updateSiteSettingsAction(
  key: SettingsKey,
  value: unknown,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireSuperAdminUser();
    const parsed = z.record(z.string(), z.unknown()).safeParse(value);
    if (!parsed.success) {
      return { success: false, error: 'Invalid settings payload' };
    }

    const { error } = await supabase.from('site_settings').upsert({
      key,
      value: parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: user!.id,
    });

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save settings',
    };
  }
}

export async function getAllSiteSettingsForAdmin() {
  try {
    const { supabase } = await requireSuperAdminUser();
    const { data, error } = await supabase.from('site_settings').select('key, value, updated_at');

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load settings',
    };
  }
}
