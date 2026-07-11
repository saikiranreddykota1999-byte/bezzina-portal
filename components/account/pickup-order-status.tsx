import { formatPickupDateTime } from '@/lib/checkout';
import { getPickupStatusLabel } from '@/lib/pickup/slots';
import type { OrderWithPickup } from '@/types/pickup';
import { PickupInstructions } from '@/components/checkout/pickup-instructions';

type Props = {
  order: OrderWithPickup;
};

export function PickupOrderStatus({ order }: Props) {
  if (order.fulfillment_method !== 'store_pickup') return null;

  return (
    <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
            Store pickup
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {getPickupStatusLabel(order.pickup_status)}
          </p>
        </div>
        {order.pickup_code && (
          <div className="rounded-lg bg-white px-3 py-2 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pickup code</p>
            <p className="font-mono text-lg font-bold text-slate-900">{order.pickup_code}</p>
          </div>
        )}
      </div>

      {order.pickup_date && order.pickup_time && (
        <p className="mt-3 text-sm text-slate-700">
          Scheduled: {formatPickupDateTime(order.pickup_date, order.pickup_time)}
        </p>
      )}

      {order.pickup_location && (
        <div className="mt-4">
          <PickupInstructions location={order.pickup_location} compact />
        </div>
      )}
    </div>
  );
}
