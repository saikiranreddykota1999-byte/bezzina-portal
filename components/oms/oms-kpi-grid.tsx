import type { OmsDashboardKpis } from '@/types/oms';
import { adminStatCardClass } from '@/components/admin/admin-styles';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Package,
  Truck,
  Warehouse,
} from 'lucide-react';

type Props = {
  kpis: OmsDashboardKpis;
};

const cards = (kpis: OmsDashboardKpis) => [
  { title: 'Pending Approval', value: kpis.pendingApproval, icon: ClipboardList, href: '/admin/orders?status=waiting_for_approval' },
  { title: 'Warehouse Queue', value: kpis.warehouseQueue, icon: Warehouse, href: '/admin/warehouse' },
  { title: 'Preparing', value: kpis.preparing, icon: Package, href: '/admin/warehouse' },
  { title: 'Ready for Delivery', value: kpis.readyForDelivery, icon: Truck, href: '/admin/delivery' },
  { title: 'Ready for Collection', value: kpis.readyForCollection, icon: CheckCircle2, href: '/admin/sales' },
  { title: 'Out for Delivery', value: kpis.outForDelivery, icon: Truck, href: '/admin/delivery' },
  { title: 'Low Stock Alerts', value: kpis.lowStock, icon: AlertTriangle, href: '/admin/inventory' },
  { title: 'Completed Today', value: kpis.completedToday, icon: CheckCircle2, href: '/admin/reports' },
];

export function OmsKpiGrid({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards(kpis).map((card) => (
        <a key={card.title} href={card.href} className={adminStatCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--admin-text-muted)]">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--admin-navy)]">{card.value}</p>
            </div>
            <div className="admin-stat-card__icon">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
