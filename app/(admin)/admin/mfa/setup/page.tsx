import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { isSuperAdminRole } from '@/lib/auth/roles';
import { mustChangePassword } from '@/lib/auth/staff-setup';
import {
  ADMIN_MFA_VERIFY_PATH,
  getSuperAdminMfaStatus,
  isSuperAdminMfaRequired,
} from '@/lib/auth/super-admin-mfa';
import { SuperAdminMfaSetupForm } from '@/components/admin/super-admin-mfa-setup-form';

export const metadata = {
  title: 'Set Up MFA | Admin',
  robots: { index: false, follow: false },
};

export default async function SuperAdminMfaSetupPage() {
  if (!isSuperAdminMfaRequired()) {
    redirect('/admin');
  }

  const session = await getAuthenticatedUser();

  if (!session.user) {
    redirect('/admin/login?redirect=/admin/mfa/setup');
  }

  if (!isSuperAdminRole(session.profile?.role)) {
    redirect('/admin?error=unauthorized');
  }

  if (mustChangePassword(session.profile)) {
    redirect('/admin/change-password');
  }

  const status = await getSuperAdminMfaStatus(session.supabase);

  if (status.verified) {
    redirect('/admin');
  }

  if (status.enrolled) {
    redirect(ADMIN_MFA_VERIFY_PATH);
  }

  return (
    <div className="admin-login-page flex min-h-screen items-center justify-center px-4 py-12">
      <div className="admin-login-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[var(--admin-navy)]">Set up two-factor authentication</h1>
        <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
          Super Admin access requires an authenticator app for every sign-in.
        </p>
        <div className="mt-8">
          <SuperAdminMfaSetupForm />
        </div>
      </div>
    </div>
  );
}
