import type { Shipment } from '@/types/payment';

export const SAMPLE_SHIPMENTS: Shipment[] = [
  {
    orderId: 'JB-2026-0042',
    trackingNumber: 'MT7829341056',
    carrier: 'Malta Post Express',
    status: 'out_for_delivery',
    estimatedDelivery: '2026-07-10',
    items: [
      { name: 'Hex Bolt M8 x 40mm', quantity: 50 },
      { name: 'Marine Hand Tools Pro Model 03', quantity: 2 },
    ],
    events: [
      { status: 'order_placed', label: 'Order placed', description: 'Your order was received.', timestamp: '2026-07-08T09:15:00Z', completed: true },
      { status: 'confirmed', label: 'Confirmed', description: 'Payment confirmed and order approved.', timestamp: '2026-07-08T09:22:00Z', completed: true },
      { status: 'packed', label: 'Packed', description: 'Items packed at Marsa warehouse.', timestamp: '2026-07-08T14:30:00Z', completed: true },
      { status: 'shipped', label: 'Shipped', description: 'Handed to Malta Post Express.', timestamp: '2026-07-09T08:00:00Z', completed: true },
      { status: 'out_for_delivery', label: 'Out for delivery', description: 'Courier is on the way.', timestamp: '2026-07-09T11:45:00Z', completed: true },
      { status: 'delivered', label: 'Delivered', description: 'Package delivered to recipient.', timestamp: null, completed: false },
    ],
  },
  {
    orderId: 'JB-2026-0038',
    trackingNumber: 'MT5512093847',
    carrier: 'DHL Malta',
    status: 'delivered',
    estimatedDelivery: '2026-07-05',
    items: [{ name: 'Safety Equipment Marine Grade Model 07', quantity: 10 }],
    events: [
      { status: 'order_placed', label: 'Order placed', description: 'Your order was received.', timestamp: '2026-07-02T10:00:00Z', completed: true },
      { status: 'confirmed', label: 'Confirmed', description: 'Payment confirmed.', timestamp: '2026-07-02T10:05:00Z', completed: true },
      { status: 'packed', label: 'Packed', description: 'Items packed at warehouse.', timestamp: '2026-07-03T09:00:00Z', completed: true },
      { status: 'shipped', label: 'Shipped', description: 'Shipped via DHL Malta.', timestamp: '2026-07-03T15:30:00Z', completed: true },
      { status: 'out_for_delivery', label: 'Out for delivery', description: 'With local courier.', timestamp: '2026-07-05T08:20:00Z', completed: true },
      { status: 'delivered', label: 'Delivered', description: 'Signed for by recipient.', timestamp: '2026-07-05T14:10:00Z', completed: true },
    ],
  },
];

export function findShipment(query: string): Shipment | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  return (
    SAMPLE_SHIPMENTS.find(
      (s) =>
        s.trackingNumber.toUpperCase() === q ||
        s.orderId.toUpperCase() === q,
    ) ?? null
  );
}
