import { AdminLayoutClient } from './admin-layout-client';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { getUnreadNotificationCount } from '@/actions/notifications';
import { isPortalRole } from '@/lib/auth/roles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthenticatedUser();
  const userName =
    session.profile?.full_name?.trim() ||
    session.user?.email?.split('@')[0] ||
    'Admin';

  const unreadNotifications =
    session.user && isPortalRole(session.profile?.role)
      ? await getUnreadNotificationCount()
      : 0;

  return (
    <AdminLayoutClient
      userRole={session.profile?.role ?? null}
      userName={userName}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AdminLayoutClient>
  );
}
