import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/server-session';
import type { AdminPermission } from '@/types/admin';

const PERMISSION_DENIED = 'You do not have permission for this action';

export async function guardAdminPage(permission: AdminPermission): Promise<void> {
  try {
    await requirePermission(permission);
  } catch (error) {
    if (error instanceof Error && error.message === PERMISSION_DENIED) {
      redirect('/admin');
    }
    throw error;
  }
}
