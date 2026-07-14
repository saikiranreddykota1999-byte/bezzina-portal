import Link from 'next/link';
import {
  Package, ShoppingBag, Users, FileText, Mail, Briefcase, TrendingUp,
  AlertTriangle, Eye, Activity,
} from 'lucide-react';
import type { DashboardStats } from '@/types/admin';
import {
  adminButtonAccentClass,
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminLinkClass,
  adminStatCardClass,
} from '@/components/admin/admin-styles';

type Props = { stats: DashboardStats };

const cards = (stats: DashboardStats) => [
  { title: 'Products', value: stats.products, icon: Package, href: '/admin/products' },
  { title: 'Quote Requests', value: stats.quotes, icon: FileText, href: '/admin/quotes' },
  { title: 'Customers', value: stats.customers, icon: Users, href: '/admin/customers' },
  { title: 'Orders', value: stats.orders, icon: ShoppingBag, href: '/admin/orders' },
  { title: 'Vacancies', value: stats.vacancies, icon: Briefcase, href: '/admin/careers' },
  { title: 'Newsletter', value: stats.subscribers, icon: Mail, href: '/admin/newsletter' },
];

const widgetCards = (stats: DashboardStats) => [
  { title: "Today's Quotes", value: stats.todaysQuotes, icon: FileText, href: '/admin/quotes' },
  { title: 'New Customers', value: stats.newCustomers, icon: Users, href: '/admin/customers' },
  { title: 'Pending Careers', value: stats.pendingCareers, icon: Briefcase, href: '/admin/careers/applications' },
  { title: 'Low Inventory', value: stats.lowInventory, icon: AlertTriangle, href: '/admin/inventory' },
];

export function DashboardStatsGrid({ stats }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards(stats).map((card) => (
          <Link key={card.title} href={card.href} className={adminStatCardClass}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--admin-text-muted)]">{card.title}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--admin-navy)]">{card.value}</p>
              </div>
              <div className="admin-stat-card__icon">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {widgetCards(stats).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="admin-card admin-card--interactive !p-4"
          >
            <div className="flex items-center gap-3">
              <div className="admin-stat-card__icon !h-9 !w-9">
                <card.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-muted)]">{card.title}</p>
                <p className="text-xl font-bold text-[var(--admin-navy)]">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={adminCardClass}>
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-[var(--admin-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Most Viewed Products</h2>
          </div>
          <ul className="space-y-3">
            {stats.mostViewedProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/products/${p.id}`} className={adminLinkClass}>
                  {p.name}
                </Link>
                <span className="text-[var(--admin-text-muted)]">{p.view_count} views</span>
              </li>
            ))}
            {stats.mostViewedProducts.length === 0 && (
              <li className="text-sm text-[var(--admin-text-muted)]">No view data yet.</li>
            )}
          </ul>
        </div>

        <div className={adminCardClass}>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--admin-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Recent Activity</h2>
          </div>
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {stats.recentActivity.map((log) => (
              <li key={log.id} className="border-b border-[var(--admin-border)] pb-2 text-sm last:border-0">
                <p className="font-medium text-[var(--admin-text)]">{log.action}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  {log.profile?.full_name ?? log.profile?.email ?? 'System'} ·{' '}
                  {new Date(log.created_at).toLocaleString('en-GB')}
                </p>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <li className="text-sm text-[var(--admin-text-muted)]">No activity logged yet.</li>
            )}
          </ul>
          <Link href="/admin/activity-logs" className={`mt-4 inline-block text-sm font-medium ${adminLinkClass}`}>
            View all activity →
          </Link>
        </div>
      </div>

      <div className={adminCardClass}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--admin-accent)]" />
          <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Quick Actions</h2>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className={adminButtonPrimaryClass}>
            Add Product
          </Link>
          <Link href="/admin/quotes" className={adminButtonSecondaryClass}>
            Review Quotes
          </Link>
          <Link href="/admin/homepage" className={adminButtonSecondaryClass}>
            Edit Homepage
          </Link>
          <Link href="/admin/media" className={adminButtonAccentClass}>
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}
