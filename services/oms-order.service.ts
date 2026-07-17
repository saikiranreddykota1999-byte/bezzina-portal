import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getInitialOmsStatus,
  getStatusFlow,
  type OrderSource,
} from '@/config/oms';
import type {
  OmsDashboardKpis,
  OmsOrder,
  OmsOrderFilters,
  OmsTimelineEntry,
  PaginatedOmsOrders,
} from '@/types/oms';
import type { OmsOrderStatus } from '@/config/oms';

function mapOrder(row: Record<string, unknown>): OmsOrder {
  return {
    id: row.id as string,
    order_number: row.order_number as string | null,
    user_id: row.user_id as string,
    status: row.status as string,
    oms_status: row.oms_status as OmsOrderStatus | null,
    order_source: row.order_source as OrderSource,
    fulfillment_method: row.fulfillment_method as 'delivery' | 'store_pickup',
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.shipping_cost),
    total: Number(row.total),
    timeline: (row.timeline as OmsTimelineEntry[]) ?? [],
    assigned_salesman_id: row.assigned_salesman_id as string | null,
    assigned_driver_id: row.assigned_driver_id as string | null,
    warehouse_id: row.warehouse_id as string | null,
    rejection_reason: row.rejection_reason as OmsOrder['rejection_reason'],
    rejection_note: row.rejection_note as string | null,
    approved_at: row.approved_at as string | null,
    approved_by: row.approved_by as string | null,
    pickup_location_id: row.pickup_location_id as string | null,
    pickup_date: row.pickup_date as string | null,
    pickup_time: row.pickup_time as string | null,
    pickup_code: row.pickup_code as string | null,
    pickup_status: row.pickup_status as string | null,
    payment_status: row.payment_status as string | null,
    payment_method: row.payment_method as string | null,
    customer_name: row.customer_name as string | null,
    customer_phone: row.customer_phone as string | null,
    customer_email: row.customer_email as string | null,
    customer_company_name: row.customer_company_name as string | null,
    customer_address: row.customer_address as string | null,
    shipping_formatted_address: row.shipping_formatted_address as string | null,
    created_at: row.created_at as string,
    items: row.items as OmsOrder['items'],
    warehouse: row.warehouse as OmsOrder['warehouse'],
    salesman: row.salesman as OmsOrder['salesman'],
    driver: row.driver as OmsOrder['driver'],
  };
}

export async function listOmsOrders(
  supabase: SupabaseClient,
  filters: OmsOrderFilters = {},
): Promise<PaginatedOmsOrders> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select(
      '*, items:order_items(*), warehouse:warehouses(code, name), salesman:profiles!orders_assigned_salesman_id_fkey(full_name, email), driver:profiles!orders_assigned_driver_id_fkey(full_name, email)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.omsStatuses?.length) {
    query = query.in('oms_status', filters.omsStatuses);
  } else if (filters.omsStatus && filters.omsStatus !== 'all') {
    query = query.eq('oms_status', filters.omsStatus);
  }
  if (filters.orderSource && filters.orderSource !== 'all') {
    query = query.eq('order_source', filters.orderSource);
  }
  if (filters.fulfillmentMethod && filters.fulfillmentMethod !== 'all') {
    query = query.eq('fulfillment_method', filters.fulfillmentMethod);
  }
  if (filters.assignedSalesmanId) {
    query = query.eq('assigned_salesman_id', filters.assignedSalesmanId);
  }
  if (filters.assignedDriverId) {
    query = query.eq('assigned_driver_id', filters.assignedDriverId);
  }
  if (filters.warehouseId) {
    query = query.eq('warehouse_id', filters.warehouseId);
  }
  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    query = query.or(
      `order_number.ilike.${q},customer_name.ilike.${q},customer_email.ilike.${q}`,
    );
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    orders: (data ?? []).map((row) => mapOrder(row as Record<string, unknown>)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOmsOrderById(
  supabase: SupabaseClient,
  orderId: string,
): Promise<OmsOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, items:order_items(*), warehouse:warehouses(code, name), salesman:profiles!orders_assigned_salesman_id_fkey(full_name, email), driver:profiles!orders_assigned_driver_id_fkey(full_name, email)',
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapOrder(data as Record<string, unknown>) : null;
}

export async function getOmsDashboardKpis(supabase: SupabaseClient): Promise<OmsDashboardKpis> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countByStatus = async (status: string) => {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('oms_status', status);
    return count ?? 0;
  };

  const [
    pendingApproval,
    warehouseQueue,
    preparing,
    readyForDelivery,
    readyForCollection,
    outForDelivery,
    walkInDrafts,
    completedToday,
    lowStock,
  ] = await Promise.all([
    countByStatus('waiting_for_approval'),
    countByStatus('sent_to_warehouse'),
    countByStatus('preparing'),
    countByStatus('ready_for_delivery'),
    countByStatus('ready_for_collection'),
    countByStatus('out_for_delivery'),
    countByStatus('draft'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('oms_status', 'completed')
      .gte('created_at', todayStart.toISOString())
      .then((r) => r.count ?? 0),
    supabase
      .from('inventory_levels')
      .select('*', { count: 'exact', head: true })
      .lte('available_stock', 5)
      .then((r) => r.count ?? 0),
  ]);

  return {
    pendingApproval,
    warehouseQueue,
    preparing,
    readyForDelivery,
    readyForCollection,
    outForDelivery,
    lowStock,
    completedToday,
    walkInDrafts,
  };
}

export function canTransitionOrder(
  order: Pick<OmsOrder, 'order_source' | 'oms_status'>,
  toStatus: OmsOrderStatus,
): boolean {
  const current = order.oms_status ?? getInitialOmsStatus(order.order_source);
  const allowed = getStatusFlow(order.order_source, current);
  return allowed.includes(toStatus);
}

export function buildTimelineEntry(
  status: OmsOrderStatus,
  actorId: string,
  actorName: string,
  note?: string,
): OmsTimelineEntry {
  return {
    status,
    note,
    actor_id: actorId,
    actor_name: actorName,
    created_at: new Date().toISOString(),
  };
}

export async function appendOrderTimeline(
  supabase: SupabaseClient,
  orderId: string,
  entry: OmsTimelineEntry,
): Promise<void> {
  const { data: order } = await supabase
    .from('orders')
    .select('timeline')
    .eq('id', orderId)
    .single();

  const timeline = [...((order?.timeline as OmsTimelineEntry[]) ?? []), entry];
  await supabase.from('orders').update({ timeline }).eq('id', orderId);
}

export async function recordStatusHistory(
  supabase: SupabaseClient,
  input: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    actorId: string;
    note?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from('order_status_history').insert({
    order_id: input.orderId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    note: input.note ?? null,
    actor_id: input.actorId,
    metadata: input.metadata ?? {},
  });
}
