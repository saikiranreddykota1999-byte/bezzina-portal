import { requirePermission } from '@/lib/auth/server-session';
import { DashboardStatsGrid } from '@/components/admin/dashboard-stats';
import { getDashboardStats } from '@/services/admin-dashboard.service';

export const metadata = { title: 'Admin Dashboard | Bezzina Portal' };

export default async function AdminDashboardPage() {
  await requirePermission('dashboard:view');
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage products, quotes, customers, and website content — no code required.
      </p>
      <div className="mt-8">
        <DashboardStatsGrid stats={stats} />
      </div>
    </div>
  );
}
