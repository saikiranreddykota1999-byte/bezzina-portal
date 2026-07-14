'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  acceptWarehouseOrderAction,
  advanceWarehouseOrderAction,
  getWarehouseQueueAction,
  rejectWarehouseOrderAction,
} from '@/actions/oms-warehouse';
import { OrderStatusBadge } from '@/components/oms/order-status-badge';
import { useOmsRealtime } from '@/hooks/use-oms-realtime';
import { WAREHOUSE_REJECT_LABELS, WAREHOUSE_REJECT_REASONS } from '@/config/oms';
import type { OmsOrder } from '@/types/oms';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminEmptyStateClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

export function WarehousePortal() {
  const [orders, setOrders] = useState<OmsOrder[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const result = await getWarehouseQueueAction();
    if (result.success) setOrders(result.data?.orders ?? []);
    else setError(result.error ?? 'Failed to load warehouse queue');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const result = await getWarehouseQueueAction();
      if (cancelled) return;
      if (result.success) setOrders(result.data?.orders ?? []);
      else setError(result.error ?? 'Failed to load warehouse queue');
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useOmsRealtime({ onOrderUpdate: load });

  async function handleAccept(orderId: string) {
    const result = await acceptWarehouseOrderAction(orderId);
    if (!result.success) setError(result.error ?? 'Accept failed');
    else await load();
  }

  async function handleReject(orderId: string) {
    const result = await rejectWarehouseOrderAction({
      orderId,
      reason: 'out_of_stock',
      note: 'Rejected from warehouse portal',
    });
    if (!result.success) setError(result.error ?? 'Reject failed');
    else await load();
  }

  async function handleAdvance(
    orderId: string,
    status: 'preparing' | 'packed' | 'ready_for_delivery' | 'ready_for_collection',
  ) {
    const result = await advanceWarehouseOrderAction(orderId, status);
    if (!result.success) setError(result.error ?? 'Update failed');
    else await load();
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

      <p className={adminSubtextClass}>
        Reject reasons: {WAREHOUSE_REJECT_REASONS.map((r) => WAREHOUSE_REJECT_LABELS[r]).join(', ')}
      </p>

      {orders.length === 0 ? (
        <p className={adminEmptyStateClass}>Warehouse queue is empty.</p>
      ) : (
        orders.map((order) => (
          <article key={order.id} className={`${adminCardClass} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono font-semibold text-[var(--admin-navy)]">{order.order_number}</p>
                <p className={`mt-1 ${adminSubtextClass}`}>{order.customer_name}</p>
                <p className="mt-1 text-sm">{order.items?.length ?? 0} lines</p>
              </div>
              <OrderStatusBadge status={order.oms_status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.oms_status === 'sent_to_warehouse' && (
                <>
                  <button type="button" className={adminButtonPrimaryClass} onClick={() => handleAccept(order.id)}>
                    Accept Order
                  </button>
                  <button type="button" className={adminButtonSecondaryClass} onClick={() => handleReject(order.id)}>
                    Reject
                  </button>
                </>
              )}
              {order.oms_status === 'warehouse_accepted' && (
                <button type="button" className={adminButtonPrimaryClass} onClick={() => handleAdvance(order.id, 'preparing')}>
                  Start Preparing
                </button>
              )}
              {order.oms_status === 'preparing' && (
                <button type="button" className={adminButtonPrimaryClass} onClick={() => handleAdvance(order.id, 'packed')}>
                  Mark Packed
                </button>
              )}
              {order.oms_status === 'packed' && (
                <button
                  type="button"
                  className={adminButtonPrimaryClass}
                  onClick={() =>
                    handleAdvance(
                      order.id,
                      order.fulfillment_method === 'store_pickup'
                        ? 'ready_for_collection'
                        : 'ready_for_delivery',
                    )
                  }
                >
                  Mark Ready
                </button>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
