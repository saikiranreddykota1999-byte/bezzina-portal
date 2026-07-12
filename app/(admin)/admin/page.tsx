import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DashboardStatsGrid } from '@/components/admin/dashboard-stats';
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
        description="Manage products, quotes, customers, and website content — no code required."
      />
      <DashboardStatsGrid stats={stats} />
    </div>
  );
}
