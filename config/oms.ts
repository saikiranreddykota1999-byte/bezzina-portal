export const ORDER_SOURCES = ['online', 'walk_in'] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

export const ONLINE_ORDER_STATUSES = [
  'draft',
  'waiting_for_approval',
  'approved',
  'sent_to_warehouse',
  'warehouse_accepted',
  'preparing',
  'packed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'completed',
  'rejected',
  'cancelled',
] as const;

export const STORE_ORDER_STATUSES = [
  'draft',
  'approved',
  'warehouse_accepted',
  'preparing',
  'ready_for_collection',
  'collected',
  'completed',
  'rejected',
  'cancelled',
] as const;

export type OnlineOrderStatus = (typeof ONLINE_ORDER_STATUSES)[number];
export type StoreOrderStatus = (typeof STORE_ORDER_STATUSES)[number];
export type OmsOrderStatus = OnlineOrderStatus | StoreOrderStatus;

export const WAREHOUSE_REJECT_REASONS = [
  'out_of_stock',
  'damaged',
  'supplier_delay',
  'wrong_quantity',
  'customer_cancelled',
  'duplicate',
  'other',
] as const;

export type WarehouseRejectReason = (typeof WAREHOUSE_REJECT_REASONS)[number];

export const WAREHOUSE_REJECT_LABELS: Record<WarehouseRejectReason, string> = {
  out_of_stock: 'Out of Stock',
  damaged: 'Damaged',
  supplier_delay: 'Supplier Delay',
  wrong_quantity: 'Wrong Quantity',
  customer_cancelled: 'Customer Cancelled',
  duplicate: 'Duplicate',
  other: 'Other',
};

export const OMS_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  waiting_for_approval: 'Waiting for Approval',
  approved: 'Approved',
  sent_to_warehouse: 'Sent to Warehouse',
  warehouse_accepted: 'Warehouse Accepted',
  preparing: 'Preparing',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  ready_for_collection: 'Ready for Collection',
  collected: 'Collected',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const ONLINE_STATUS_FLOW: Record<OnlineOrderStatus, OnlineOrderStatus[]> = {
  draft: ['waiting_for_approval', 'cancelled'],
  waiting_for_approval: ['approved', 'rejected', 'cancelled'],
  approved: ['sent_to_warehouse', 'cancelled'],
  sent_to_warehouse: ['warehouse_accepted', 'rejected'],
  warehouse_accepted: ['preparing', 'rejected'],
  preparing: ['packed', 'rejected'],
  packed: ['ready_for_delivery', 'rejected'],
  ready_for_delivery: ['out_for_delivery', 'rejected'],
  out_for_delivery: ['delivered', 'rejected'],
  delivered: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

export const STORE_STATUS_FLOW: Record<StoreOrderStatus, StoreOrderStatus[]> = {
  draft: ['approved', 'cancelled'],
  approved: ['warehouse_accepted', 'rejected', 'cancelled'],
  warehouse_accepted: ['preparing', 'rejected'],
  preparing: ['ready_for_collection', 'rejected'],
  ready_for_collection: ['collected', 'rejected'],
  collected: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

export function getInitialOmsStatus(source: OrderSource): OmsOrderStatus {
  return source === 'walk_in' ? 'draft' : 'waiting_for_approval';
}

export function getStatusFlow(source: OrderSource, status: OmsOrderStatus): OmsOrderStatus[] {
  if (source === 'walk_in') {
    return STORE_STATUS_FLOW[status as StoreOrderStatus] ?? [];
  }
  return ONLINE_STATUS_FLOW[status as OnlineOrderStatus] ?? [];
}

export function isTerminalOmsStatus(status: OmsOrderStatus): boolean {
  return status === 'completed' || status === 'rejected' || status === 'cancelled';
}

export const REPORT_TYPES = [
  'sales',
  'inventory',
  'warehouse',
  'customers',
  'salesman',
  'delivery',
  'audit',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_PERIODS = ['daily', 'weekly', 'monthly'] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];
