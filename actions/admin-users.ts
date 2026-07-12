'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSuperAdminUser } from '@/lib/auth/server-session';
import type { UserRole } from '@/types/user';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['customer', 'admin', 'super_admin']),
});

export async function getAdminUsers() {
  try {
    const { supabase } = await requireSuperAdminUser();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_disabled, created_at')
      .in('role', ['customer', 'admin', 'super_admin'])
      .order('created_at', { ascending: false });

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load users',
    };
  }
}

export async function updateUserRole(input: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireSuperAdminUser();
    const parsed = updateRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    if (parsed.data.userId === user!.id && parsed.data.role !== 'super_admin') {
      return { success: false, error: 'You cannot demote your own Super Admin account' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: parsed.data.role as UserRole })
      .eq('id', parsed.data.userId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update role',
    };
  }
}

export async function createAdminUser(input: unknown): Promise<ActionResult> {
  try {
    await requireSuperAdminUser();
    const parsed = z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(8),
        role: z.enum(['admin', 'super_admin']),
        full_name: z.string().trim().min(2).max(128),
      })
      .safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();

    const { data: created, error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name },
    });

    if (error || !created.user) {
      return { success: false, error: error?.message ?? 'Failed to create user' };
    }

    await admin.from('profiles').upsert({
      id: created.user.id,
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create admin',
    };
  }
}

export async function deleteAdminUser(userId: string): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdminUser();
    if (userId === user!.id) {
      return { success: false, error: 'You cannot delete your own account' };
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}
