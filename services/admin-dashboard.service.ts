import { createClient } from '@/lib/supabase/server';
import type { DashboardStats } from '@/types/admin';
import { getOmsDashboardKpis } from '@/services/oms-order.service';

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const todayStart = startOfTodayIso();

  const [
    products,
    categories,
    quotes,
    customers,
    orders,
    vacancies,
    subscribers,
    todaysQuotes,
    newCustomers,
    pendingCareers,
    lowInventory,
    mostViewed,
    recentActivity,
    omsKpis,
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', todayStart),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }).in('status', ['received', 'reviewing']),
    supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5).eq('is_active', true),
    supabase.from('products').select('id, name, view_count').order('view_count', { ascending: false }).limit(5),
    supabase.from('activity_logs').select('*, profile:profiles(email, full_name)').order('created_at', { ascending: false }).limit(8),
    getOmsDashboardKpis(supabase),
  ]);

  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    quotes: quotes.count ?? 0,
    customers: customers.count ?? 0,
    orders: orders.count ?? 0,
    vacancies: vacancies.count ?? 0,
    subscribers: subscribers.count ?? 0,
    todaysQuotes: todaysQuotes.count ?? 0,
    newCustomers: newCustomers.count ?? 0,
    pendingCareers: pendingCareers.count ?? 0,
    lowInventory: lowInventory.count ?? 0,
    mostViewedProducts: (mostViewed.data ?? []).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      view_count: (p.view_count as number) ?? 0,
    })),
    recentActivity: recentActivity.data ?? [],
    oms: omsKpis,
  };
}
