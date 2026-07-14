'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission, requireSuperAdminUser } from '@/lib/auth/server-session';
import type { AdminCustomer } from '@/types/admin';
import { parseBulkIds } from '@/lib/security/bulk-ids';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const updateCustomerSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().max(128).optional(),
  phone: z.string().trim().max(32).optional(),
  company_name: z.string().trim().max(128).optional(),
  is_disabled: z.boolean().optional(),
});

export async function getAdminCustomers(): Promise<ActionResult<AdminCustomer[]>> {
  try {
    const { supabase } = await requirePermission('customers:manage');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, company_name, role, is_disabled, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as AdminCustomer[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load customers',
    };
  }
}

export async function getAdminCustomer(id: string) {
  try {
    const { supabase } = await requirePermission('customers:manage');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, company_name, role, is_disabled, created_at')
      .eq('id', id)
      .eq('role', 'customer')
      .maybeSingle();

    if (error) return { success: false as const, error: error.message };
    if (!data) return { success: false as const, error: 'Customer not found' };

    const { data: quotes } = await supabase
      .from('quote_requests')
      .select('id, reference, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    return { success: true as const, data: { customer: data as AdminCustomer, quotes: quotes ?? [] } };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load customer',
    };
  }
}

export async function updateAdminCustomer(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('customers:manage');
    const parsed = updateCustomerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        company_name: parsed.data.company_name,
        is_disabled: parsed.data.is_disabled,
      })
      .eq('id', parsed.data.id)
      .eq('role', 'customer');

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${parsed.data.id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer',
    };
  }
}

export async function bulkDisableCustomers(ids: string[]): Promise<ActionResult> {
  const idsParsed = parseBulkIds(ids);
  if (!idsParsed.success) {
    return { success: false, error: idsParsed.error.issues[0]?.message ?? 'Invalid selection' };
  }

  try {
    const { supabase } = await requirePermission('customers:manage');
    const { error } = await supabase
      .from('profiles')
      .update({ is_disabled: true })
      .in('id', idsParsed.data)
      .eq('role', 'customer');

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk disable failed',
    };
  }
}

export async function resetCustomerPasswordAction(userId: string): Promise<ActionResult<{ email: string }>> {
  try {
    await requireSuperAdminUser();
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.role !== 'customer') {
      return { success: false, error: 'Password reset is only available for customer accounts.' };
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      return { success: false, error: 'Customer not found' };
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const { error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: userData.user.email,
      options: { redirectTo: `${origin}/account/reset-password` },
    });

    if (error) return { success: false, error: 'Failed to send reset link.' };
    return { success: true, data: { email: userData.user.email } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset link',
    };
  }
}
