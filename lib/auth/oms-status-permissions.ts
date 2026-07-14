import type { AdminPermission } from '@/types/admin';
import type { OmsOrderStatus } from '@/config/oms';

const WAREHOUSE_STATUSES: OmsOrderStatus[] = [
  'warehouse_accepted',
  'preparing',
  'packed',
  'ready_for_delivery',
  'ready_for_collection',
  'completed',
  'collected',
];

const DELIVERY_STATUSES: OmsOrderStatus[] = ['out_for_delivery', 'delivered'];

const APPROVAL_STATUSES: OmsOrderStatus[] = ['approved', 'sent_to_warehouse'];

export function getStatusTransitionPermission(toStatus: OmsOrderStatus): AdminPermission {
  if (WAREHOUSE_STATUSES.includes(toStatus)) return 'warehouse:operate';
  if (DELIVERY_STATUSES.includes(toStatus)) return 'delivery:operate';
  if (APPROVAL_STATUSES.includes(toStatus)) return 'orders:approve';
  if (toStatus === 'rejected' || toStatus === 'cancelled') return 'orders:manage';
  return 'orders:manage';
}

export function canPerformStatusTransition(
  role: string | null | undefined,
  toStatus: OmsOrderStatus,
  hasPermission: (role: string | null | undefined, permission: AdminPermission) => boolean,
): boolean {
  const required = getStatusTransitionPermission(toStatus);
  return (
    hasPermission(role, required) ||
    hasPermission(role, 'orders:manage') ||
    (required === 'orders:approve' && hasPermission(role, 'sales:operate'))
  );
}
