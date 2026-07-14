import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DashboardStatsGrid } from '@/components/admin/dashboard-stats';
import { OmsKpiGrid } from '@/components/oms/oms-kpi-grid';
import { guardAdminPage } from '@/lib/admin/guard-page';
import { getDashboardStats } from '@/services/admin-dashboard.service';

export const metadata = { title: 'Admin Dashboard | Bezzina Portal' };

export default async function AdminDashboardPage() {
  await guardAdminPage('dashboard:view');
  const stats = await getDashboardStats();

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Order queues, KPIs, inventory alerts, and operational tasks across roles."
      />
      {stats.oms && <OmsKpiGrid kpis={stats.oms} />}
      <div className="mt-8">
        <DashboardStatsGrid stats={stats} />
      </div>
    </div>
  );
}
