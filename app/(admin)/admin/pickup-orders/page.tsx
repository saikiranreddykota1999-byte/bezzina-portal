'use client';

import { useEffect, useState } from 'react';
import { getStaffPickupOrders, updatePickupOrderStatusAction } from '@/actions/pickup/staff';
import type { OrderWithPickup } from '@/types/pickup';
import { formatPickupDateTime } from '@/lib/checkout';
import { getPickupStatusLabel } from '@/lib/pickup/slots';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminEmptyStateClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

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
      <AdminPageHeader
        title="Pickup Orders"
        description="Mark orders as ready for pickup or collected when customers arrive."
      />

      {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className={adminEmptyStateClass}>No store pickup orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`${adminCardClass} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono font-semibold text-[var(--admin-navy)]">{order.order_number}</p>
                  <p className={`mt-1 ${adminSubtextClass}`}>
                    {order.pickup_location?.name ?? 'Pickup branch'}
                  </p>
                  {order.pickup_date && order.pickup_time && (
                    <p className={`mt-1 text-sm text-[var(--admin-text)]`}>
                      {formatPickupDateTime(order.pickup_date, order.pickup_time)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--admin-navy)]">€{Number(order.total).toFixed(2)}</p>
                  <p className="text-sm text-[var(--admin-accent)]">
                    {getPickupStatusLabel(order.pickup_status)}
                  </p>
                  {order.pickup_code && (
                    <p className="mt-2 font-mono text-sm font-semibold text-[var(--admin-navy)]">
                      {order.pickup_code}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {order.pickup_status !== 'ready_for_pickup' && order.pickup_status !== 'collected' && (
                  <button
                    type="button"
                    className={adminButtonPrimaryClass}
                    onClick={() => updateStatus(order.id, 'ready_for_pickup')}
                  >
                    Mark ready for pickup
                  </button>
                )}
                {order.pickup_status !== 'collected' && (
                  <button
                    type="button"
                    className={adminButtonSecondaryClass}
                    onClick={() => updateStatus(order.id, 'collected')}
                  >
                    Mark collected
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
