import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OmsOrdersManager } from '@/components/admin/oms-orders-manager';

export const metadata = { title: 'Orders | Admin' };

export default async function AdminOrdersPage() {
  await guardAdminPage('orders:view');

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        description="Unified online and walk-in order workflow with approval, warehouse, and delivery stages."
      />
      <OmsOrdersManager />
    </div>
  );
}
