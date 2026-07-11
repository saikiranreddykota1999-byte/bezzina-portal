import Link from 'next/link';
import { getCustomerOrders } from '@/actions/pickup';
import { PickupOrderStatus } from '@/components/account/pickup-order-status';
import { RippleButton } from '@/components/ui/ripple-button';
import { getPickupStatusLabel } from '@/lib/pickup/slots';

export default async function OrdersPage() {
  const result = await getCustomerOrders();
  const orders = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
      <p className="mt-1 text-sm text-slate-500">
        View past orders, pickup codes, and delivery status.
      </p>

      {!result.success && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {result.error ?? 'Unable to load orders right now.'}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No orders yet.</p>
            <RippleButton href="/products" className="mt-4">
              Browse products
            </RippleButton>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono font-semibold text-slate-900">
                    {order.order_number ?? order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Intl.DateTimeFormat('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(order.created_at))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">€{Number(order.total).toFixed(2)}</p>
                  <p className="text-sm capitalize text-orange-600">
                    {order.fulfillment_method === 'store_pickup'
                      ? getPickupStatusLabel(order.pickup_status)
                      : order.status}
                  </p>
                </div>
                {order.order_number && (
                  <RippleButton
                    href={`/account/orders/${encodeURIComponent(order.order_number)}/receipt`}
                    variant="ghost"
                  >
                    Receipt
                  </RippleButton>
                )}
                {order.fulfillment_method === 'delivery' && order.order_number && (
                  <RippleButton
                    href={`/account/tracking?order=${encodeURIComponent(order.order_number)}`}
                    variant="ghost"
                  >
                    Track
                  </RippleButton>
                )}
              </div>

              <PickupOrderStatus order={order} />
            </div>
          ))
        )}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Track any shipment at{' '}
        <Link href="/track" className="text-orange-600 hover:underline">
          /track
        </Link>
      </p>
    </div>
  );
}
