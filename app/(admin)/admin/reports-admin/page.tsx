import { guardAdminPage } from '@/lib/admin/guard-page';
import { ReportsAdminDashboard } from '@/components/admin/reports-admin-dashboard';

export const metadata = { title: 'Reports Admin | Bezzina Portal' };

export default async function ReportsAdminPage() {
  await guardAdminPage('reports:view');
  return <ReportsAdminDashboard />;
}
