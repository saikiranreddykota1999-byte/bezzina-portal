import type { SupabaseClient } from '@supabase/supabase-js';
import type { OmsReportSnapshot } from '@/types/oms';
import type { ReportPeriod, ReportType } from '@/config/oms';

function periodBounds(period: ReportPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(end.getDate() - 7);
  } else {
    start.setMonth(end.getMonth() - 1);
  }

  return { start, end };
}

export async function generateOmsReport(
  supabase: SupabaseClient,
  reportType: ReportType,
  period: ReportPeriod,
): Promise<OmsReportSnapshot> {
  const { start, end } = periodBounds(period);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  let metrics: Record<string, unknown> = {};

  if (reportType === 'sales') {
    const { data: orders } = await supabase
      .from('orders')
      .select('total, order_source, oms_status')
      .gte('created_at', startIso)
      .lte('created_at', endIso);

    const rows = orders ?? [];
    metrics = {
      orderCount: rows.length,
      revenue: rows.reduce((sum, o) => sum + Number(o.total), 0),
      onlineOrders: rows.filter((o) => o.order_source === 'online').length,
      walkInOrders: rows.filter((o) => o.order_source === 'walk_in').length,
      completedOrders: rows.filter((o) => o.oms_status === 'completed').length,
    };
  }

  if (reportType === 'inventory') {
    const { count: lowStock } = await supabase
      .from('inventory_levels')
      .select('*', { count: 'exact', head: true })
      .lte('available_stock', 5);

    const { data: levels } = await supabase
      .from('inventory_levels')
      .select('current_stock, reserved_stock, incoming_stock, available_stock');

    const rows = levels ?? [];
    metrics = {
      skuCount: rows.length,
      totalOnHand: rows.reduce((sum, r) => sum + r.current_stock, 0),
      totalReserved: rows.reduce((sum, r) => sum + r.reserved_stock, 0),
      totalIncoming: rows.reduce((sum, r) => sum + r.incoming_stock, 0),
      lowStock: lowStock ?? 0,
    };
  }

  if (reportType === 'warehouse') {
    const statuses = ['sent_to_warehouse', 'warehouse_accepted', 'preparing', 'packed', 'ready_for_delivery', 'ready_for_collection'];
    const counts: Record<string, number> = {};

    await Promise.all(
      statuses.map(async (status) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('oms_status', status)
          .gte('created_at', startIso);
        counts[status] = count ?? 0;
      }),
    );

    metrics = { statusCounts: counts };
  }

  if (reportType === 'customers') {
    const { count: newCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', startIso);

    const { count: activeBuyers } = await supabase
      .from('orders')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', startIso);

    metrics = {
      newCustomers: newCustomers ?? 0,
      ordersPlaced: activeBuyers ?? 0,
    };
  }

  if (reportType === 'salesman') {
    const { data } = await supabase
      .from('orders')
      .select('assigned_salesman_id, total')
      .eq('order_source', 'walk_in')
      .gte('created_at', startIso)
      .not('assigned_salesman_id', 'is', null);

    const bySalesman: Record<string, { orders: number; revenue: number }> = {};
    for (const row of data ?? []) {
      const id = row.assigned_salesman_id as string;
      if (!bySalesman[id]) bySalesman[id] = { orders: 0, revenue: 0 };
      bySalesman[id].orders += 1;
      bySalesman[id].revenue += Number(row.total);
    }
    metrics = { performance: bySalesman };
  }

  if (reportType === 'delivery') {
    const { count: outForDelivery } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('oms_status', 'out_for_delivery');

    const { count: delivered } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('oms_status', 'delivered')
      .gte('created_at', startIso);

    metrics = { outForDelivery: outForDelivery ?? 0, delivered: delivered ?? 0 };
  }

  if (reportType === 'audit') {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('action, entity, created_at')
      .gte('created_at', startIso)
      .order('created_at', { ascending: false })
      .limit(100);

    metrics = {
      eventCount: logs?.length ?? 0,
      recentEvents: logs ?? [],
    };
  }

  const periodStart = start.toISOString().slice(0, 10);
  const periodEnd = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('oms_report_snapshots')
    .upsert(
      {
        report_type: reportType,
        period,
        period_start: periodStart,
        period_end: periodEnd,
        metrics,
      },
      { onConflict: 'report_type,period,period_start' },
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as OmsReportSnapshot;
}
