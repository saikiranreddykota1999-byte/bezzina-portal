'use client';

import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import '@/app/admin-theme.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-admin',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string;
  unreadNotifications?: number;
};

export function AdminLayoutClient({ children, userRole, userName, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <div className={`${inter.variable} font-[family-name:var(--font-admin)]`}>{children}</div>;
  }

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-admin)]`}>
      <AdminShell
        userRole={userRole}
        userName={userName}
        unreadNotifications={unreadNotifications}
      >
        {children}
      </AdminShell>
    </div>
  );
}
