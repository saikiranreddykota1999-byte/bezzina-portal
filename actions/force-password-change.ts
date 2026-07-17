'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuthenticatedUser } from '@/lib/auth/server-session';
import { mustChangePassword } from '@/lib/auth/staff-setup';
import { changePasswordSchema } from '@/lib/validators/auth';
import { logActivity } from '@/services/activity-log.service';


export async function completeRequiredPasswordChangeAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAdminAuthenticatedUser('/admin/change-password');

    if (!mustChangePassword(session.profile)) {
      return { success: false, error: 'Password change is not required for this account.' };
    }

    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Password does not meet requirements.',
      };
    }

    const supabase = await createClient();
    const { error: authError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (authError) {
      return { success: false, error: 'Unable to update password. Please try again.' };
    }

    // Privileged column — must use service role after session auth checks.
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from('profiles')
      .update({ force_password_change: false })
      .eq('id', session.user!.id);

    if (profileError) {
      return { success: false, error: 'Password updated but profile flag could not be cleared.' };
    }

    await logActivity({
      userId: session.user!.id,
      action: 'password_change_required_completed',
      entity: 'profile',
      entityId: session.user!.id,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

export async function getForcePasswordChangeStatus(): Promise<{ required: boolean }> {
  const session = await requireAdminAuthenticatedUser('/admin/change-password');
  return { required: mustChangePassword(session.profile) };
}
