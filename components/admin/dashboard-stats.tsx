import Link from 'next/link';
import {
  Package, ShoppingBag, Users, FileText, Mail, Briefcase, TrendingUp,
  AlertTriangle, Eye, Activity,
} from 'lucide-react';
import type { DashboardStats } from '@/types/admin';

type Props = { stats: DashboardStats };

const cards = (stats: DashboardStats) => [
  { title: 'Products', value: stats.products, icon: Package, href: '/admin/products' },
  { title: 'Quote Requests', value: stats.quotes, icon: FileText, href: '/admin/quotes' },
  { title: 'Customers', value: stats.customers, icon: Users, href: '/admin/customers' },
  { title: 'Orders', value: stats.orders, icon: ShoppingBag, href: '/admin/pickup-orders' },
  { title: 'Vacancies', value: stats.vacancies, icon: Briefcase, href: '/admin/careers' },
  { title: 'Newsletter', value: stats.subscribers, icon: Mail, href: '/admin/newsletter' },
];

const widgetCards = (stats: DashboardStats) => [
  { title: "Today's Quotes", value: stats.todaysQuotes, icon: FileText, href: '/admin/quotes' },
  { title: 'New Customers', value: stats.newCustomers, icon: Users, href: '/admin/customers' },
  { title: 'Pending Careers', value: stats.pendingCareers, icon: Briefcase, href: '/admin/careers/applications' },
  { title: 'Low Inventory', value: stats.lowInventory, icon: AlertTriangle, href: '/admin/products' },
];

export function DashboardStatsGrid({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards(stats).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              </div>
              <card.icon className="h-5 w-5 text-orange-500" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {widgetCards(stats).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-300"
          >
            <div className="flex items-center gap-3">
              <card.icon className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">{card.title}</p>
                <p className="text-xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Most Viewed Products</h2>
          </div>
          <ul className="space-y-2">
            {stats.mostViewedProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/products/${p.id}`} className="text-slate-800 hover:text-orange-600">
                  {p.name}
                </Link>
                <span className="text-slate-500">{p.view_count} views</span>
              </li>
            ))}
            {stats.mostViewedProducts.length === 0 && (
              <li className="text-sm text-slate-500">No view data yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          </div>
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {stats.recentActivity.map((log) => (
              <li key={log.id} className="border-b border-slate-100 pb-2 text-sm last:border-0">
                <p className="font-medium text-slate-800">{log.action}</p>
                <p className="text-xs text-slate-500">
                  {log.profile?.full_name ?? log.profile?.email ?? 'System'} ·{' '}
                  {new Date(log.created_at).toLocaleString('en-GB')}
                </p>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <li className="text-sm text-slate-500">No activity logged yet.</li>
            )}
          </ul>
          <Link href="/admin/activity-logs" className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline">
            View all activity →
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white">
            Add Product
          </Link>
          <Link href="/admin/quotes" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
            Review Quotes
          </Link>
          <Link href="/admin/homepage" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
            Edit Homepage
          </Link>
          <Link href="/admin/media" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}
