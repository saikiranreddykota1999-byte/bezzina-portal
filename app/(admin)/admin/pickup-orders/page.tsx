'use client';

import { useEffect, useState } from 'react';
import { getStaffPickupOrders, updatePickupOrderStatusAction } from '@/actions/pickup';
import type { OrderWithPickup } from '@/types/pickup';
import { formatPickupDateTime } from '@/lib/checkout';
import { getPickupStatusLabel } from '@/lib/pickup/slots';
import { RippleButton } from '@/components/ui/ripple-button';

export default function AdminPickupOrdersPage() {
  const [orders, setOrders] = useState<OrderWithPickup[]>([]);
  const [error, setError] = useState('');

  async function loadOrders() {
    const result = await getStaffPickupOrders();
    if (result.success) {
      setOrders(result.data ?? []);
      setError('');
      return;
    }
    setError(result.error ?? 'Failed to load pickup orders');
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const result = await getStaffPickupOrders();
      if (cancelled) return;
      if (result.success) {
        setOrders(result.data ?? []);
        setError('');
        return;
      }
      setError(result.error ?? 'Failed to load pickup orders');
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(orderId: string, pickupStatus: 'ready_for_pickup' | 'collected') {
    const result = await updatePickupOrderStatusAction({ orderId, pickupStatus });
    if (result.success) {
      await loadOrders();
    } else {
      setError(result.error ?? 'Failed to update order');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pickup Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mark orders as ready for pickup or collected when customers arrive.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No store pickup orders yet.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white">
                    {order.order_number}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.pickup_location?.name ?? 'Pickup branch'}
                  </p>
                  {order.pickup_date && order.pickup_time && (
                    <p className="mt-1 text-sm text-slate-600">
                      {formatPickupDateTime(order.pickup_date, order.pickup_time)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">
                    €{Number(order.total).toFixed(2)}
                  </p>
                  <p className="text-sm text-orange-600">
                    {getPickupStatusLabel(order.pickup_status)}
                  </p>
                  {order.pickup_code && (
                    <p className="mt-2 font-mono text-sm font-semibold">{order.pickup_code}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {order.pickup_status !== 'ready_for_pickup' && order.pickup_status !== 'collected' && (
                  <RippleButton
                    type="button"
                    onClick={() => updateStatus(order.id, 'ready_for_pickup')}
                  >
                    Mark ready for pickup
                  </RippleButton>
                )}
                {order.pickup_status !== 'collected' && (
                  <RippleButton
                    type="button"
                    variant="ghost"
                    onClick={() => updateStatus(order.id, 'collected')}
                  >
                    Mark collected
                  </RippleButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
