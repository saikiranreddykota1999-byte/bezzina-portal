import { getAdminUsers } from '@/actions/admin-users';
import { UsersManager } from '@/components/admin/users-manager';

export const metadata = { title: 'Users & Roles | Admin' };

export default async function AdminUsersPage() {
  const result = await getAdminUsers();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
      <p className="mt-1 text-sm text-slate-600">Super Admin only — create admins and manage roles.</p>
      <div className="mt-8">
        <UsersManager users={result.data ?? []} />
      </div>
    </div>
  );
}
