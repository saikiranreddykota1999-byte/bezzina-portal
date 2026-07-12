import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminUsers } from '@/actions/admin-users';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { UsersManager } from '@/components/admin/users-manager';

export const metadata = { title: 'Users & Roles | Admin' };

export default async function AdminUsersPage() {
  await guardAdminPage('users:manage');
  const result = await getAdminUsers();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Users & Roles"
        description="Super Admin only — create admins and manage roles."
      />
      <UsersManager users={result.data ?? []} />
    </div>
  );
}
