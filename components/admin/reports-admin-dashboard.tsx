import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OmsReportsPanel } from '@/components/admin/oms-reports-panel';
import { adminCardClass } from '@/components/admin/admin-styles';
import { REPORT_TYPES } from '@/config/oms';

export function ReportsAdminDashboard() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reports Admin"
        description="Sales, inventory, warehouse throughput, delivery performance, and audit reporting."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORT_TYPES.map((type) => (
          <div key={type} className={`${adminCardClass} p-4 capitalize`}>
            <p className="text-sm font-medium text-[var(--admin-text-muted)]">{type} report</p>
            <p className="mt-2 text-lg font-bold text-[var(--admin-navy)]">Daily · Weekly · Monthly</p>
          </div>
        ))}
      </div>

      <OmsReportsPanel />
    </div>
  );
}
