'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Users, Package, FolderTree, GitBranch,
  Award, Warehouse, Percent, Clock, Calendar, TrendingUp, FileText,
  Newspaper, Images, Image, Mail, Truck, MapPin, UserCog, Shield, Key,
  Settings, BarChart3, Activity, MessageSquare, Search, Database, Terminal,
  LogOut, Moon, Sun, Menu, X, Store,
} from 'lucide-react';
import { useState } from 'react';
import { ADMIN_NAV } from '@/config/admin-nav';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { company } from '@/config/company';
import { SignOutButton } from '@/components/auth/sign-out-button';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, ShoppingBag, Users, Package, FolderTree, GitBranch,
  Award, Warehouse, Percent, Clock, Calendar, TrendingUp, FileText,
  Newspaper, Images, Image, Mail, Truck, MapPin, Store, UserCog, Shield, Key,
  Settings, BarChart3, Activity, MessageSquare, Search, Database, Terminal,
};

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white/95 backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-900/95 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ctext x='10' y='60' font-size='14' fill='%23000'%3EJB%3C/text%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
            aria-hidden
          />

          <div className="relative border-b border-slate-200 p-5 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Admin</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{company.shortName}</p>
          </div>

          <nav className="relative flex-1 overflow-y-auto p-3">
            {ADMIN_NAV.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="relative border-t border-slate-200 p-3 dark:border-slate-800">
            <SignOutButton
              redirectTo="/account/login"
              className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </SignOutButton>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Exit to site
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <p className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 lg:block">
            Enterprise Dashboard
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/admin/profile" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white">
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </ThemeProvider>
  );
}
