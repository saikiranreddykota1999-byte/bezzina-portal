'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, FolderTree, FileText, Briefcase,
  UserCheck, Home, Globe, Image, Mail, Search, MapPin, Store, Shield,
  Settings, UserCog, LogOut, Moon, Sun, Menu, X, Anchor, Factory, Activity,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ADMIN_NAV } from '@/config/admin-nav';
import { filterNavByRole } from '@/lib/auth/permissions';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { company } from '@/config/company';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { AdminNotificationBell } from '@/components/admin/admin-notification-bell';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, FolderTree, FileText, Briefcase, UserCheck,
  Home, Globe, Image, Mail, Search, MapPin, Store, Shield, Settings, UserCog,
  Anchor, Factory, Activity,
};

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string;
  unreadNotifications?: number;
};

function AdminShellInner({ children, userRole, userName, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => filterNavByRole([...ADMIN_NAV], userRole),
    [userRole],
  );

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-900/10 bg-slate-950 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">Admin Portal</p>
            <p className="mt-1 text-sm font-semibold text-white">{company.shortName}</p>
            <p className="mt-1 text-xs text-slate-400">{userName}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const active =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            <SignOutButton
              redirectTo="/account/login"
              className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </SignOutButton>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Exit to site
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close admin menu' : 'Open admin menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <p className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 lg:block">
            Joseph Bezzina Admin
          </p>

          <div className="flex items-center gap-3">
            <AdminNotificationBell initialCount={unreadNotifications} />
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              href="/admin/profile"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white"
            >
              Profile
            </Link>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function AdminShell({ children, userRole, userName, unreadNotifications }: Props) {
  return (
    <ThemeProvider>
      <AdminShellInner userRole={userRole} userName={userName} unreadNotifications={unreadNotifications}>
        {children}
      </AdminShellInner>
    </ThemeProvider>
  );
}
