'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getOmsOrdersAction, updateOmsOrderStatusAction } from '@/actions/oms-orders';
import { OrderStatusBadge } from '@/components/oms/order-status-badge';
import { useOmsRealtime } from '@/hooks/use-oms-realtime';
import { OMS_STATUS_LABELS } from '@/config/oms';
import type { OmsOrder } from '@/types/oms';
import type { OmsOrderStatus } from '@/config/oms';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminEmptyStateClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

const APPROVAL_ACTIONS: Partial<Record<OmsOrderStatus, OmsOrderStatus>> = {
  waiting_for_approval: 'approved',
  approved: 'sent_to_warehouse',
  sent_to_warehouse: 'warehouse_accepted',
};

type Props = {
  initialStatus?: OmsOrderStatus | 'all';
};

export function OmsOrdersManager({ initialStatus = 'all' }: Props) {
  const [orders, setOrders] = useState<OmsOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getOmsOrdersAction({
      omsStatus: initialStatus,
      pageSize: 50,
    });
    if (result.success) {
      setOrders(result.data?.orders ?? []);
      setError('');
    } else {
      setError(result.error ?? 'Failed to load orders');
    }
    setLoading(false);
  }, [initialStatus]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      const result = await getOmsOrdersAction({
        omsStatus: initialStatus,
        pageSize: 50,
      });
      if (cancelled) return;
      if (result.success) {
        setOrders(result.data?.orders ?? []);
        setError('');
      } else {
        setError(result.error ?? 'Failed to load orders');
      }
      setLoading(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [initialStatus]);

  useOmsRealtime({ onOrderUpdate: load });

  async function advance(orderId: string, toStatus: OmsOrderStatus) {
    const result = await updateOmsOrderStatusAction({ orderId, toStatus });
    if (result.success) await load();
    else setError(result.error ?? 'Status update failed');
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

      {loading ? (
        <p className={adminSubtextClass}>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className={adminEmptyStateClass}>No orders in this queue.</p>
      ) : (
        orders.map((order) => {
          const next = order.oms_status ? APPROVAL_ACTIONS[order.oms_status] : undefined;
          return (
            <article key={order.id} className={`${adminCardClass} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-[var(--admin-navy)] hover:underline">
                    {order.order_number}
                  </Link>
                  <p className={`mt-1 ${adminSubtextClass}`}>
                    {order.customer_name ?? 'Customer'} · {order.order_source === 'walk_in' ? 'Walk-in' : 'Online'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--admin-text)]">
                    {order.items?.length ?? 0} item(s) · €{Number(order.total).toFixed(2)}
                  </p>
                </div>
                <OrderStatusBadge status={order.oms_status} />
              </div>

              {next && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className={adminButtonPrimaryClass}
                    onClick={() => advance(order.id, next)}
                  >
                    Mark {OMS_STATUS_LABELS[next]}
                  </button>
                  <button
                    type="button"
                    className={adminButtonSecondaryClass}
                    onClick={() => advance(order.id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
