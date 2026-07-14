import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { isPortalRole } from '@/lib/auth/roles';
import {
  ADMIN_CHANGE_PASSWORD_PATH,
  mustChangePassword,
} from '@/lib/auth/staff-setup';
import { RequiredPasswordChangeForm } from '@/components/admin/required-password-change-form';

export const metadata = {
  title: 'Change Password | Admin',
  robots: { index: false, follow: false },
};

export default async function AdminChangePasswordPage() {
  const session = await getAuthenticatedUser();

  if (!session.user) {
    redirect(`/admin/login?redirect=${encodeURIComponent(ADMIN_CHANGE_PASSWORD_PATH)}`);
  }

  if (!isPortalRole(session.profile?.role)) {
    redirect('/account?error=unauthorized');
  }

  if (!mustChangePassword(session.profile)) {
    redirect('/admin');
  }

  return (
    <div className="admin-login-page flex min-h-screen items-center justify-center px-4 py-12">
      <div className="admin-login-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[var(--admin-navy)]">Set your new password</h1>
        <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
          This is required on first login for newly provisioned staff accounts.
        </p>
        <div className="mt-8">
          <RequiredPasswordChangeForm userRole={session.profile?.role ?? null} />
        </div>
      </div>
    </div>
  );
}
