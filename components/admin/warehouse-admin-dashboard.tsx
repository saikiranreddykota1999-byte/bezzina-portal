import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OmsKpiGrid } from '@/components/oms/oms-kpi-grid';
import { WarehousePortal } from '@/components/warehouse/warehouse-portal';
import { getOmsDashboardKpis } from '@/services/oms-order.service';
import { createClient } from '@/lib/supabase/server';

export async function WarehouseAdminDashboard() {
  const supabase = await createClient();
  const kpis = await getOmsDashboardKpis(supabase);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Warehouse Admin"
        description="Live order queue, accept/reject workflow, and fulfilment status for warehouse teams."
      />
      <OmsKpiGrid
        kpis={{
          ...kpis,
          pendingApproval: 0,
          readyForDelivery: kpis.readyForDelivery,
          readyForCollection: kpis.readyForCollection,
        }}
      />
      <WarehousePortal />
    </div>
  );
}
