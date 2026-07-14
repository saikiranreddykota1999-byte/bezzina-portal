import { guardAdminPage } from '@/lib/admin/guard-page';
import { InventoryAdminDashboard } from '@/components/admin/inventory-admin-dashboard';

export const metadata = { title: 'Inventory Admin | Bezzina Portal' };

export default async function InventoryAdminPage() {
  await guardAdminPage('inventory:view');
  return <InventoryAdminDashboard />;
}
