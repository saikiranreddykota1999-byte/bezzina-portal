'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string;
  unreadNotifications?: number;
};

export function AdminLayoutClient({ children, userRole, userName, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminShell
      userRole={userRole}
      userName={userName}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AdminShell>
  );
}
