import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DeliveryPortal } from '@/components/delivery/delivery-portal';

export const metadata = { title: 'Delivery | Admin' };

export default async function DeliveryPage() {
  await guardAdminPage('delivery:operate');

  return (
    <div>
      <AdminPageHeader
        title="Delivery Portal"
        description="Manage outbound deliveries from ready through delivered."
      />
      <DeliveryPortal />
    </div>
  );
}
