import { createAdminClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/security/sanitize-error';

/**
 * Internal helper — not a Server Action. Call only from gated admin actions.
 */
export async function revokeAllSessionsForUser(
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.signOut(userId, 'global');
    if (error) {
      return { success: false, error: 'Failed to revoke sessions.' };
    }
    return { success: true };
  } catch (error) {
    logServerError('revokeAllSessionsForUser', error);
    return { success: false, error: 'Failed to revoke sessions.' };
  }
}
