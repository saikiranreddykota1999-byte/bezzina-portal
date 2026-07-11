'use server';

import { revalidatePath } from 'next/cache';
import { requireStaffUser } from '@/lib/auth/server-session';
import { createClient } from '@/lib/supabase/server';
import { jobPostingSchema, jobApplicationSchema } from '@/lib/validators/catalogue';
import type { JobPosting } from '@/types/quote';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getActiveJobPostings(): Promise<JobPosting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getActiveJobPostings:', error.message);
    return [];
  }
  return (data ?? []) as JobPosting[];
}

export async function getJobPosting(id: string): Promise<JobPosting | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  return (data as JobPosting) ?? null;
}

export async function submitJobApplication(
  input: unknown,
  cvFile: FormData,
): Promise<ActionResult> {
  const parsed = jobApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const file = cvFile.get('cv');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'CV/Resume file is required (PDF or DOC)' };
  }

  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) {
    return { success: false, error: 'CV must be PDF or DOC format' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'CV must be under 5 MB' };
  }

  const supabase = await createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `applications/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('career-documents')
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabase.storage.from('career-documents').getPublicUrl(path);

  const { error } = await supabase.from('job_applications').insert({
    job_posting_id: parsed.data.jobPostingId ?? null,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    linkedin_url: parsed.data.linkedinUrl || null,
    cover_letter: parsed.data.coverLetter ?? null,
    cv_url: urlData.publicUrl,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminJobPostings(): Promise<ActionResult<JobPosting[]>> {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('sort_order');

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as JobPosting[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load postings',
    };
  }
}

export async function upsertJobPosting(input: unknown, id?: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const parsed = jobPostingSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    if (id) {
      const { error } = await supabase.from('job_postings').update(parsed.data).eq('id', id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from('job_postings').insert(parsed.data);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save posting',
    };
  }
}

export async function deleteJobPosting(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const { error } = await supabase.from('job_postings').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete posting',
    };
  }
}
