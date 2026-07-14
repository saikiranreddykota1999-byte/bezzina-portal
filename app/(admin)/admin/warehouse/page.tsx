import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { WarehousePortal } from '@/components/warehouse/warehouse-portal';

export const metadata = { title: 'Warehouse | Admin' };

export default async function WarehousePage() {
  await guardAdminPage('warehouse:operate');

  return (
    <div>
      <AdminPageHeader
        title="Warehouse Portal"
        description="Accept, prepare, pack, and release orders with realtime updates."
      />
      <WarehousePortal />
    </div>
  );
}
