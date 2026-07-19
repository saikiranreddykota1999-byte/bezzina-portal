import type { FulfillmentMethod } from '@/types/pickup';
import { splitVatInclusive } from '@/lib/receipt';

export const DELIVERY_SHIPPING_COST = 12.5;

export function calculateShippingCost(
  method: FulfillmentMethod,
  itemCount: number,
): number {
  if (itemCount === 0) return 0;
  return method === 'store_pickup' ? 0 : DELIVERY_SHIPPING_COST;
}

/** Totals are VAT-inclusive (Malta 18%); vat/net are for display/receipts. */
export function calculateOrderTotals(
  subtotal: number,
  method: FulfillmentMethod,
  itemCount: number,
) {
  const shipping = calculateShippingCost(method, itemCount);
  const total = subtotal + shipping;
  const { net, vat } = splitVatInclusive(total);
  return { subtotal, shipping, total, vat, net };
}

export function formatPickupAddress(location: {
  line1: string;
  line2?: string | null;
  city: string;
  postal_code: string;
  country: string;
}): string {
  const parts = [
    location.line1,
    location.line2,
    `${location.city}, ${location.postal_code}`,
    location.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function formatPickupDateTime(date: string, time: string): string {
  const normalizedTime = time.slice(0, 5);
  const dateObj = new Date(`${date}T${normalizedTime}:00`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
