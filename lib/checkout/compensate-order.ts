import type { SupabaseClient } from '@supabase/supabase-js';

/** Best-effort cleanup when post-insert steps fail after an order row exists. */
export async function compensateFailedOrder(
  client: SupabaseClient,
  orderId: string,
): Promise<void> {
  await client.from('pickup_slot_bookings').delete().eq('order_id', orderId);
  await client.from('order_notification_logs').delete().eq('order_id', orderId);
  await client.from('order_status_history').delete().eq('order_id', orderId);
  await client.from('order_items').delete().eq('order_id', orderId);
  await client.from('orders').delete().eq('id', orderId);
}
