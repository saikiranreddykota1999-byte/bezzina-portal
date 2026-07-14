'use client';

import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AdminShell } from '@/components/admin/admin-shell';
import { LoadingSplash } from '@/components/brand/LoadingSplash';
import { SessionIdleGuard } from '@/components/auth/session-idle-guard';
import { isAdminPasswordChangePath } from '@/lib/auth/staff-setup';
import { isSuperAdminMfaPath } from '@/lib/auth/super-admin-mfa';
import '@/app/admin-theme.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-admin',
  display: 'swap',
});

const SPLASH_SESSION_KEY = 'bezzina-admin-splash-seen';

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string;
  unreadNotifications?: number;
};

export function AdminLayoutClient({ children, userRole, userName, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (window.sessionStorage.getItem(SPLASH_SESSION_KEY)) return;

    const frame = requestAnimationFrame(() => setShowSplash(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  function handleSplashComplete() {
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    setShowSplash(false);
  }

  if (
    pathname === '/admin/login' ||
    isAdminPasswordChangePath(pathname) ||
    isSuperAdminMfaPath(pathname)
  ) {
    return <div className={`${inter.variable} font-[family-name:var(--font-admin)]`}>{children}</div>;
  }

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-admin)]`}>
      <SessionIdleGuard enabled />
      <AnimatePresence>
        {showSplash ? <LoadingSplash onComplete={handleSplashComplete} /> : null}
      </AnimatePresence>
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
