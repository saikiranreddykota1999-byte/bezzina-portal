import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OmsReportsPanel } from '@/components/admin/oms-reports-panel';

export const metadata = { title: 'Reports | Admin' };

export default async function ReportsPage() {
  await guardAdminPage('reports:view');

  return (
    <div>
      <AdminPageHeader
        title="OMS Reports"
        description="Daily, weekly, and monthly sales, inventory, warehouse, and performance reports."
      />
      <OmsReportsPanel />
    </div>
  );
}
