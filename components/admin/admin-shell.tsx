'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, FolderTree, FileText, Briefcase,
  UserCheck, Home, Globe, ImageIcon, Mail, Search, MapPin, Store, Shield,
  Settings, UserCog, LogOut, Menu, X, Anchor, Factory, Activity,
  ChevronLeft, ChevronRight, Calendar, ShoppingBag, Warehouse, Truck,
  Boxes, BarChart3, UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ADMIN_NAV } from '@/config/admin-nav';
import { filterNavByRole } from '@/lib/auth/permissions';
import { company } from '@/config/company';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { AdminNotificationBell } from '@/components/admin/admin-notification-bell';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';
import { AdminBrand } from '@/components/brand/AdminBrand';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';
import { BrandBackground } from '@/components/brand/BrandBackground';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, FolderTree, FileText, Briefcase, UserCheck,
  Home, Globe, Image: ImageIcon, Mail, Search, MapPin, Store, Shield, Settings, UserCog,
  Anchor, Factory, Activity, ShoppingBag, Warehouse, Truck, Boxes, BarChart3, UserRound,
};

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string;
  unreadNotifications?: number;
};

function formatRole(role: string | null) {
  if (!role) return 'Staff';
  return role.replace(/_/g, ' ');
}

function AdminShellInner({ children, userRole, userName, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = useMemo(
    () => filterNavByRole([...ADMIN_NAV], userRole),
    [userRole],
  );

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const filteredNav = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.title.toLowerCase().includes(q));
  }, [navItems, searchQuery]);

  return (
    <div className="relative flex min-h-screen" data-admin-portal>
      <BrandBackground />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[var(--admin-navy)]/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex transform flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'admin-sidebar--collapsed w-20' : 'w-[var(--admin-sidebar-width)]'}`}
      >
        <div className={`border-b border-white/10 px-4 py-5 ${collapsed ? 'px-2' : ''}`}>
          <AdminBrand collapsed={collapsed} />
        </div>

        {!collapsed && (
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs text-white/50">Signed in as</p>
            <p className="truncate text-sm font-medium text-white">{userName}</p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          {filteredNav.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.title : undefined}
                className={`admin-nav-link ${active ? 'admin-nav-link--active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="admin-nav-link mb-1 hidden w-full lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <SignOutButton
            redirectTo="/account/login"
            className={`admin-nav-link mb-1 w-full ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </SignOutButton>
          <Link href="/" className={`admin-nav-link ${collapsed ? 'justify-center px-2' : ''}`} aria-label="Exit to site">
            {!collapsed && <span>Exit to site</span>}
            {collapsed ? <span className="sr-only">Exit to site</span> : null}
          </Link>
        </div>
      </aside>

      <div className="admin-content flex min-h-screen flex-1 flex-col">
        <header className="admin-header admin-header--glass flex items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="admin-btn admin-btn--secondary !min-h-0 !p-2 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <AnimatedLogo variant="admin-topbar" hoverable />
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-bold text-[var(--admin-navy)]">{company.shortName}</p>
                <p className="truncate text-xs text-[var(--admin-text-muted)]">Admin Management Portal</p>
              </div>
            </div>

            <div className="relative hidden max-w-md flex-1 md:block lg:ml-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search navigation…"
                className="admin-input !py-2 !pl-10 text-sm"
                aria-label="Search admin navigation"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1.5 text-xs text-[var(--admin-text-muted)] lg:flex">
              <Calendar className="h-3.5 w-3.5" />
              <span>{today}</span>
            </div>
            <span className="admin-role-badge hidden sm:inline-flex">{formatRole(userRole)}</span>
            <AdminNotificationBell initialCount={unreadNotifications} />
            <Link href="/admin/profile" className="admin-btn admin-btn--primary !min-h-0 !px-4 !py-2 text-sm">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </div>
        </header>

        <motion.main
          id="main-content"
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-[1] flex-1 px-4 py-6 outline-none lg:px-8 lg:py-8"
          tabIndex={-1}
        >
          <AdminBreadcrumb />
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function AdminShell({ children, userRole, userName, unreadNotifications }: Props) {
  return (
    <AdminShellInner userRole={userRole} userName={userName} unreadNotifications={unreadNotifications}>
      {children}
    </AdminShellInner>
  );
}
