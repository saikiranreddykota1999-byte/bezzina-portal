'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { validateUploadFile, sanitizeUploadFileName } from '@/lib/security/upload-validation';
import { productIdSchema } from '@/lib/security/bulk-ids';
import { vacancySoftDeletePayload } from '@/lib/security/soft-delete';
import { jobApplicationSchema, vacancySchema } from '@/lib/validators/catalogue';
import type { Vacancy } from '@/types/quote';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getActiveVacancies(): Promise<Vacancy[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getActiveVacancies:', error.message);
    return [];
  }
  return (data ?? []) as Vacancy[];
}

/** @deprecated Use getActiveVacancies */
export async function getActiveJobPostings(): Promise<Vacancy[]> {
  return getActiveVacancies();
}

export async function getVacancy(id: string): Promise<Vacancy | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  return (data as Vacancy) ?? null;
}

/** @deprecated Use getVacancy */
export async function getJobPosting(id: string): Promise<Vacancy | null> {
  return getVacancy(id);
}

export async function submitJobApplication(
  input: unknown,
  cvFile: FormData,
): Promise<ActionResult> {
  const parsed = jobApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const allowed = await checkPublicRateLimit('career_application', `${ip}:${parsed.data.email}`);
  if (!allowed) {
    return { success: false, error: 'Too many applications. Please try again later.' };
  }

  const file = cvFile.get('cv');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'CV/Resume file is required (PDF or DOC)' };
  }

  const fileCheck = validateUploadFile(file, 'cv');
  if (!fileCheck.valid) {
    return { success: false, error: fileCheck.error };
  }

  const admin = createAdminClient();
  const safeName = sanitizeUploadFileName(file.name);
  const path = `applications/${Date.now()}-${safeName}`;

  const { error: uploadError } = await admin.storage
    .from('career-documents')
    .upload(path, file, { contentType: fileCheck.contentType });

  if (uploadError) return { success: false, error: 'Failed to upload CV. Please try again.' };

  const supabase = await createClient();
  const vacancyId = parsed.data.vacancyId ?? parsed.data.jobPostingId ?? null;

  const { error } = await supabase.from('job_applications').insert({
    vacancy_id: vacancyId,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    linkedin_url: parsed.data.linkedinUrl || null,
    cover_letter: parsed.data.coverLetter ?? null,
    cv_url: path,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminVacancies(): Promise<ActionResult<Vacancy[]>> {
  try {
    const { supabase } = await requirePermission('careers:manage');
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Vacancy[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load vacancies',
    };
  }
}

/** @deprecated Use getAdminVacancies */
export async function getAdminJobPostings(): Promise<ActionResult<Vacancy[]>> {
  return getAdminVacancies();
}

export async function upsertVacancy(input: unknown, id?: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('careers:manage');
    const parsed = vacancySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const payload = {
      ...parsed.data,
      requirements: parsed.data.requirements ?? null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await supabase.from('vacancies').update(payload).eq('id', id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from('vacancies').insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save vacancy',
    };
  }
}

/** @deprecated Use upsertVacancy */
export async function upsertJobPosting(input: unknown, id?: string): Promise<ActionResult> {
  return upsertVacancy(input, id);
}

export async function deleteVacancy(id: string): Promise<ActionResult> {
  const idParsed = productIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: 'Invalid vacancy id' };
  }

  try {
    const { supabase } = await requirePermission('careers:manage');
    const { error } = await supabase
      .from('vacancies')
      .update(vacancySoftDeletePayload())
      .eq('id', idParsed.data)
      .is('deleted_at', null);
    if (error) return { success: false, error: error.message };
    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete vacancy',
    };
  }
}

/** @deprecated Use deleteVacancy */
export async function deleteJobPosting(id: string): Promise<ActionResult> {
  return deleteVacancy(id);
}
