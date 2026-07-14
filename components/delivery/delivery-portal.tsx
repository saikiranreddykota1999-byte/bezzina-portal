'use client';

import { useCallback, useEffect, useState } from 'react';
import { getOmsOrdersAction, updateOmsOrderStatusAction } from '@/actions/oms-orders';
import { OrderStatusBadge } from '@/components/oms/order-status-badge';
import { useOmsRealtime } from '@/hooks/use-oms-realtime';
import type { OmsOrder } from '@/types/oms';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminEmptyStateClass,
} from '@/components/admin/admin-styles';

export function DeliveryPortal() {
  const [orders, setOrders] = useState<OmsOrder[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [ready, out] = await Promise.all([
      getOmsOrdersAction({ omsStatus: 'ready_for_delivery', pageSize: 50 }),
      getOmsOrdersAction({ omsStatus: 'out_for_delivery', pageSize: 50 }),
    ]);
    const combined = [
      ...(ready.success ? ready.data?.orders ?? [] : []),
      ...(out.success ? out.data?.orders ?? [] : []),
    ];
    setOrders(combined);
    if (!ready.success && !out.success) {
      setError(ready.error ?? out.error ?? 'Failed to load delivery queue');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [ready, out] = await Promise.all([
        getOmsOrdersAction({ omsStatus: 'ready_for_delivery', pageSize: 50 }),
        getOmsOrdersAction({ omsStatus: 'out_for_delivery', pageSize: 50 }),
      ]);
      if (cancelled) return;
      const combined = [
        ...(ready.success ? ready.data?.orders ?? [] : []),
        ...(out.success ? out.data?.orders ?? [] : []),
      ];
      setOrders(combined);
      if (!ready.success && !out.success) {
        setError(ready.error ?? out.error ?? 'Failed to load delivery queue');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useOmsRealtime({ onOrderUpdate: load });

  async function updateStatus(orderId: string, toStatus: 'out_for_delivery' | 'delivered' | 'completed') {
    const result = await updateOmsOrderStatusAction({ orderId, toStatus });
    if (!result.success) setError(result.error ?? 'Update failed');
    else await load();
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}
      {orders.length === 0 ? (
        <p className={adminEmptyStateClass}>No deliveries assigned.</p>
      ) : (
        orders.map((order) => (
          <article key={order.id} className={`${adminCardClass} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono font-semibold text-[var(--admin-navy)]">{order.order_number}</p>
                <p className="text-sm text-[var(--admin-text-muted)]">{order.customer_name}</p>
                <p className="mt-1 text-sm">{order.shipping_formatted_address ?? 'Address on file'}</p>
              </div>
              <OrderStatusBadge status={order.oms_status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {order.oms_status === 'ready_for_delivery' && (
                <button type="button" className={adminButtonPrimaryClass} onClick={() => updateStatus(order.id, 'out_for_delivery')}>
                  Out for Delivery
                </button>
              )}
              {order.oms_status === 'out_for_delivery' && (
                <>
                  <button type="button" className={adminButtonPrimaryClass} onClick={() => updateStatus(order.id, 'delivered')}>
                    Mark Delivered
                  </button>
                  <button type="button" className={adminButtonSecondaryClass} onClick={() => updateStatus(order.id, 'completed')}>
                    Complete
                  </button>
                </>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
