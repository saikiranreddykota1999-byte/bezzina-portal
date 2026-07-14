import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationType } from '@/types/notification';
import type { OmsOrderStatus } from '@/config/oms';
import { OMS_STATUS_LABELS } from '@/config/oms';

type NotifyRoles = Array<
  'customer' | 'salesman' | 'sales_manager' | 'warehouse_manager' | 'warehouse_staff' | 'delivery_driver' | 'admin' | 'super_admin'
>;

export async function notifyOmsRoles(
  roles: NotifyRoles,
  input: {
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
    metadata?: Record<string, unknown>;
    excludeUserId?: string;
  },
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .in('role', roles)
      .eq('is_disabled', false);

    const recipients = (users ?? []).filter((u) => u.id !== input.excludeUserId);
    if (!recipients.length) return;

    await supabase.from('notifications').insert(
      recipients.map((user) => ({
        user_id: user.id,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        metadata: input.metadata ?? {},
      })),
    );
  } catch (error) {
    console.error('notify_oms_roles_failed', error);
  }
}

export async function notifyOrderStatusChange(input: {
  orderId: string;
  orderNumber: string | null;
  customerUserId: string;
  toStatus: OmsOrderStatus;
  note?: string;
  actorId: string;
}): Promise<void> {
  const label = OMS_STATUS_LABELS[input.toStatus] ?? input.toStatus;
  const orderRef = input.orderNumber ?? input.orderId.slice(0, 8);
  const link = `/admin/orders/${input.orderId}`;

  await Promise.all([
    createAdminClient()
      .from('notifications')
      .insert({
        user_id: input.customerUserId,
        type: 'order_update',
        title: `Order ${orderRef} updated`,
        body: `Status: ${label}${input.note ? ` — ${input.note}` : ''}`,
        link: `/account/orders`,
        metadata: { order_id: input.orderId, oms_status: input.toStatus },
      }),
    notifyOmsRoles(['salesman', 'sales_manager', 'warehouse_manager', 'warehouse_staff', 'delivery_driver', 'admin', 'super_admin'], {
      type: 'order_update',
      title: `Order ${orderRef}: ${label}`,
      body: input.note,
      link,
      metadata: { order_id: input.orderId, oms_status: input.toStatus },
      excludeUserId: input.actorId,
    }),
  ]);
}

export async function notifyWarehouseQueue(orderNumber: string | null, orderId: string): Promise<void> {
  await notifyOmsRoles(['warehouse_manager', 'warehouse_staff'], {
    type: 'order_update',
    title: `New warehouse order: ${orderNumber ?? orderId.slice(0, 8)}`,
    body: 'An approved order is waiting in the warehouse queue.',
    link: `/admin/warehouse`,
    metadata: { order_id: orderId },
  });
}

export async function notifySalesmanReady(
  salesmanId: string | null,
  orderNumber: string | null,
  orderId: string,
  status: OmsOrderStatus,
): Promise<void> {
  if (!salesmanId) return;

  const supabase = createAdminClient();
  await supabase.from('notifications').insert({
    user_id: salesmanId,
    type: 'order_update',
    title: `Order ${orderNumber ?? orderId.slice(0, 8)} is ready`,
    body: `Status: ${OMS_STATUS_LABELS[status] ?? status}`,
    link: `/admin/sales`,
    metadata: { order_id: orderId, oms_status: status },
  });
}
