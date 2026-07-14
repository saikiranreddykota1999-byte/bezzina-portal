import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { isSuperAdminRole } from '@/lib/auth/roles';
import { mustChangePassword, ADMIN_CHANGE_PASSWORD_PATH } from '@/lib/auth/staff-setup';
import {
  ADMIN_MFA_SETUP_PATH,
  getSuperAdminMfaStatus,
  isSuperAdminMfaRequired,
} from '@/lib/auth/super-admin-mfa';
import { SuperAdminMfaVerifyForm } from '@/components/admin/super-admin-mfa-verify-form';

export const metadata = {
  title: 'Verify MFA | Admin',
  robots: { index: false, follow: false },
};

export default async function SuperAdminMfaVerifyPage() {
  if (!isSuperAdminMfaRequired()) {
    redirect('/admin');
  }

  const session = await getAuthenticatedUser();

  if (!session.user) {
    redirect('/admin/login?redirect=/admin/mfa/verify');
  }

  if (!isSuperAdminRole(session.profile?.role)) {
    redirect('/admin?error=unauthorized');
  }

  if (mustChangePassword(session.profile)) {
    redirect(ADMIN_CHANGE_PASSWORD_PATH);
  }

  const status = await getSuperAdminMfaStatus(session.supabase);

  if (status.verified) {
    redirect('/admin');
  }

  if (!status.enrolled) {
    redirect(ADMIN_MFA_SETUP_PATH);
  }

  return (
    <div className="admin-login-page flex min-h-screen items-center justify-center px-4 py-12">
      <div className="admin-login-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[var(--admin-navy)]">Verify your identity</h1>
        <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
          Enter the code from your authenticator app to access the Super Admin portal.
        </p>
        <div className="mt-8">
          <SuperAdminMfaVerifyForm />
        </div>
      </div>
    </div>
  );
}
