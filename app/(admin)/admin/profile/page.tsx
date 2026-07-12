import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { AdminProfileForm } from '@/components/admin/admin-profile-form';

export const metadata = { title: 'Admin Profile' };

export default async function AdminProfilePage() {
  const session = await getAuthenticatedUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-600">Your admin account details.</p>
      <div className="mt-8 max-w-lg">
        <AdminProfileForm
          email={session.user?.email ?? ''}
          fullName={session.profile?.full_name ?? ''}
          role={session.profile?.role ?? 'admin'}
        />
      </div>
    </div>
  );
}
