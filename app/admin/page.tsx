import { DashboardCards, RevenueChartPlaceholder } from '@/components/admin/dashboard-cards';

export const metadata = { title: 'Admin Dashboard | Bezzina Portal' };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your marine and industrial supply portal.</p>
      <div className="mt-8">
        <DashboardCards />
        <RevenueChartPlaceholder />
      </div>
    </div>
  );
}
