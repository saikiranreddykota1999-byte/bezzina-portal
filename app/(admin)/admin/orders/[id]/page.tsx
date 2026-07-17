import Link from 'next/link';
import { guardAdminPage } from '@/lib/admin/guard-page';
import { getOmsOrderAction } from '@/actions/oms-orders';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OrderStatusBadge } from '@/components/oms/order-status-badge';
import { adminButtonSecondaryClass, adminCardClass } from '@/components/admin/admin-styles';

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  await guardAdminPage('orders:view');
  const { id } = await params;
  const result = await getOmsOrderAction(id);

  if (!result.success || !result.data) {
    return (
      <p className="text-[var(--admin-danger)]">
        {!result.success ? result.error : 'Order not found'}
      </p>
    );
  }

  const order = result.data;

  return (
    <div>
      <AdminPageHeader
        title={order.order_number ?? 'Order'}
        description={`${order.order_source === 'walk_in' ? 'Walk-in' : 'Online'} · ${order.fulfillment_method}`}
        actions={
          <Link href="/admin/orders" className={adminButtonSecondaryClass}>
            Back to orders
          </Link>
        }
      />

      <div className={`${adminCardClass} mb-6 p-5`}>
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.oms_status} />
          <span className="text-sm text-[var(--admin-text-muted)]">
            {order.customer_name} · {order.customer_email ?? 'No email'}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-[var(--admin-navy)]">€{Number(order.total).toFixed(2)}</p>
      </div>

      <div className={`${adminCardClass} p-5`}>
        <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Line Items</h2>
        <ul className="mt-4 divide-y divide-slate-200">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-mono text-xs text-[var(--admin-text-muted)]">{item.sku}</span>
            </li>
          ))}
        </ul>
      </div>

      {order.timeline?.length > 0 && (
        <div className={`${adminCardClass} mt-6 p-5`}>
          <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Timeline</h2>
          <ol className="mt-4 space-y-3">
            {order.timeline.map((entry, index) => (
              <li key={`${entry.created_at}-${index}`} className="text-sm">
                <OrderStatusBadge status={entry.status} />
                <span className="ml-2 text-[var(--admin-text-muted)]">
                  {entry.actor_name} · {new Date(entry.created_at).toLocaleString('en-GB')}
                </span>
                {entry.note && <p className="mt-1 text-[var(--admin-text)]">{entry.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
