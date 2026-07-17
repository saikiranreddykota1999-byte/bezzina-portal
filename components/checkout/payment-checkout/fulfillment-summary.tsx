import Link from 'next/link';
import { MapPin, Store } from 'lucide-react';
import { formatPickupDateTime } from '@/lib/checkout';
import type { CheckoutPickupSelection, DeliveryAddress } from '@/types/pickup';

type Props = {
  isPickup: boolean;
  pickup: CheckoutPickupSelection | null;
  deliveryAddress: DeliveryAddress | null;
};

export function CheckoutFulfillmentSummary({
  isPickup,
  pickup,
  deliveryAddress,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 text-slate-900">
        {isPickup ? (
          <Store className="h-5 w-5 text-orange-800" />
        ) : (
          <MapPin className="h-5 w-5 text-orange-800" />
        )}
        <h2 className="font-semibold">
          {isPickup ? 'Store pickup' : 'Delivery address'}
        </h2>
      </div>

      {isPickup && pickup ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">
            Scheduled for {formatPickupDateTime(pickup.pickupDate, pickup.pickupTime)}
          </p>
          <Link href="/account/checkout" className="text-sm text-orange-800 hover:underline">
            Change pickup details
          </Link>
        </div>
      ) : deliveryAddress ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-700">{deliveryAddress.formattedAddress}</p>
          <Link href="/account/checkout" className="text-sm text-orange-800 hover:underline">
            Change delivery address
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-sm text-red-600">
          No delivery address set.{' '}
          <Link href="/account/checkout" className="underline">
            Go to checkout
          </Link>
        </p>
      )}
    </section>
  );
}
