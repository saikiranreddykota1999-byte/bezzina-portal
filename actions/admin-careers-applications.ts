'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/server-session';


const applicationStatusSchema = z.enum([
  'received',
  'reviewing',
  'shortlisted',
  'interview',
  'rejected',
  'hired',
]);

function resolveCvStoragePath(cvUrl: string): string {
  if (!cvUrl.startsWith('http')) return cvUrl;
  const marker = '/career-documents/';
  const index = cvUrl.indexOf(marker);
  if (index === -1) return cvUrl;
  return cvUrl.slice(index + marker.length);
}

async function withSignedCvUrls<T extends { cv_url: string }>(
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  rows: T[],
): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      const storagePath = resolveCvStoragePath(row.cv_url);
      const { data, error } = await supabase.storage
        .from('career-documents')
        .createSignedUrl(storagePath, 3600);

      if (error || !data?.signedUrl) return row;
      return { ...row, cv_url: data.signedUrl };
    }),
  );
}

export async function getJobApplicationsAction() {
  try {
    const { supabase } = await requirePermission('careers:manage');
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, vacancy:vacancies(title, department)')
      .order('created_at', { ascending: false });

    if (error) return { success: false as const, error: error.message };

    const withSignedUrls = await withSignedCvUrls(supabase, data ?? []);
    return { success: true as const, data: withSignedUrls };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load applications',
    };
  }
}

export async function updateApplicationStatusAction(
  id: string,
  status: z.infer<typeof applicationStatusSchema>,
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('careers:manage');
    const parsed = applicationStatusSchema.safeParse(status);
    if (!parsed.success) return { success: false, error: 'Invalid status' };

    const { error } = await supabase
      .from('job_applications')
      .update({ status: parsed.data })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/careers/applications');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}
