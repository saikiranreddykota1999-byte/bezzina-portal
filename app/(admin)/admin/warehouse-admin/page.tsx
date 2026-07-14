import { guardAdminPage } from '@/lib/admin/guard-page';
import { WarehouseAdminDashboard } from '@/components/admin/warehouse-admin-dashboard';

export const metadata = { title: 'Warehouse Admin | Bezzina Portal' };

export default async function WarehouseAdminPage() {
  await guardAdminPage('warehouse:operate');
  return <WarehouseAdminDashboard />;
}
