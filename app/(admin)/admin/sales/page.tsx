import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SalesmanPortal } from '@/components/salesman/salesman-portal';

export const metadata = { title: 'Sales | Admin' };

export default async function SalesPage() {
  await guardAdminPage('sales:operate');

  return (
    <div>
      <AdminPageHeader
        title="Salesman Portal"
        description="Barcode scanning, walk-in orders, customer lookup, and printable invoices."
      />
      <SalesmanPortal />
    </div>
  );
}
