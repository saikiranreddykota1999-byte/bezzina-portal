import type {
  OmsOrderStatus,
  OrderSource,
  ReportPeriod,
  ReportType,
  WarehouseRejectReason,
} from '@/config/oms';

export type OmsTimelineEntry = {
  status: OmsOrderStatus;
  note?: string;
  actor_id?: string;
  actor_name?: string;
  created_at: string;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  line1: string | null;
  city: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductLocation = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  warehouse_id: string;
  zone: string | null;
  rack: string | null;
  shelf: string | null;
  bin: string | null;
  warehouse?: Pick<Warehouse, 'code' | 'name'> | null;
};

export type InventoryLevel = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  warehouse_id: string;
  current_stock: number;
  reserved_stock: number;
  incoming_stock: number;
  min_stock: number;
  max_stock: number | null;
  available_stock: number;
  updated_at: string;
  warehouse?: Pick<Warehouse, 'code' | 'name'> | null;
  product?: { id: string; name: string; sku: string; barcode: string | null } | null;
  variant?: { id: string; name: string; sku: string; barcode: string | null } | null;
};

export type InventoryTransactionType = 'reserve' | 'release' | 'deduct' | 'receive' | 'adjust';

export type InventoryTransaction = {
  id: string;
  inventory_level_id: string;
  order_id: string | null;
  transaction_type: InventoryTransactionType;
  quantity: number;
  note: string | null;
  actor_id: string | null;
  created_at: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: { full_name: string | null; email: string } | null;
};

export type OmsOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number | null;
};

export type OmsOrder = {
  id: string;
  order_number: string | null;
  user_id: string;
  status: string;
  oms_status: OmsOrderStatus | null;
  order_source: OrderSource;
  fulfillment_method: 'delivery' | 'store_pickup';
  subtotal: number;
  shipping_cost: number;
  total: number;
  timeline: OmsTimelineEntry[];
  assigned_salesman_id: string | null;
  assigned_driver_id: string | null;
  warehouse_id: string | null;
  rejection_reason: WarehouseRejectReason | null;
  rejection_note: string | null;
  approved_at: string | null;
  approved_by: string | null;
  pickup_location_id: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  pickup_code: string | null;
  pickup_status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_company_name: string | null;
  customer_address?: string | null;
  shipping_formatted_address?: string | null;
  created_at: string;
  items?: OmsOrderItem[];
  warehouse?: Pick<Warehouse, 'code' | 'name'> | null;
  salesman?: { full_name: string | null; email: string } | null;
  driver?: { full_name: string | null; email: string } | null;
};

export type OmsOrderFilters = {
  query?: string;
  omsStatus?: OmsOrderStatus | 'all';
  orderSource?: OrderSource | 'all';
  fulfillmentMethod?: 'delivery' | 'store_pickup' | 'all';
  assignedSalesmanId?: string;
  assignedDriverId?: string;
  warehouseId?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedOmsOrders = {
  orders: OmsOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OmsDashboardKpis = {
  pendingApproval: number;
  warehouseQueue: number;
  preparing: number;
  readyForDelivery: number;
  readyForCollection: number;
  outForDelivery: number;
  lowStock: number;
  completedToday: number;
  walkInDrafts: number;
};

export type OmsReportSnapshot = {
  id: string;
  report_type: ReportType;
  period: ReportPeriod;
  period_start: string;
  period_end: string;
  metrics: Record<string, unknown>;
  created_at: string;
};

export type WalkInOrderLine = {
  productId: string;
  variantId?: string | null;
  sku: string;
  name: string;
  quantity: number;
  unitPrice?: number | null;
};

export type BarcodeLookupResult = {
  type: 'product' | 'variant';
  id: string;
  productId: string;
  sku: string;
  name: string;
  barcode: string;
  price: number | null;
  inStock: boolean;
  location?: ProductLocation | null;
  inventory?: InventoryLevel | null;
};
