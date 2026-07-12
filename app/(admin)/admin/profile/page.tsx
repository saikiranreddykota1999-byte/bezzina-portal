import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminProfileForm } from '@/components/admin/admin-profile-form';

export const metadata = { title: 'Admin Profile' };

export default async function AdminProfilePage() {
  await guardAdminPage('dashboard:view');
  const session = await getAuthenticatedUser();

  return (
    <div>
      <AdminPageHeader
        title="Profile"
        description="Your admin account details."
      />
      <div className="max-w-lg">
        <AdminProfileForm
          email={session.user?.email ?? ''}
          fullName={session.profile?.full_name ?? ''}
          role={session.profile?.role ?? 'admin'}
        />
      </div>
    </div>
  );
}
