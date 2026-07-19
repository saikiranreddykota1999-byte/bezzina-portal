import type { DeliveryStatus, Shipment, TrackingEvent } from '@/types/payment';
import type { OmsTimelineEntry } from '@/types/oms';

export type TrackableOrder = {
  order_number: string | null;
  tracking_number: string | null;
  status: string | null;
  oms_status: string | null;
  fulfillment_method: string | null;
  created_at: string;
  pickup_date?: string | null;
  timeline?: OmsTimelineEntry[] | null;
  items?: { name: string; quantity: number }[] | null;
};

const STATUS_LABELS: Record<DeliveryStatus, { label: string; description: string }> = {
  order_placed: {
    label: 'Order placed',
    description: 'Your order was received.',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Payment confirmed and order approved.',
  },
  packed: {
    label: 'Packed',
    description: 'Items packed at the warehouse.',
  },
  shipped: {
    label: 'Shipped',
    description: 'Handed to the delivery partner.',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    description: 'Courier is on the way.',
  },
  delivered: {
    label: 'Delivered',
    description: 'Package delivered to recipient.',
  },
};

const PIPELINE: DeliveryStatus[] = [
  'order_placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export function resolveDeliveryStatus(order: TrackableOrder): DeliveryStatus {
  const oms = (order.oms_status ?? '').toLowerCase();
  const status = (order.status ?? '').toLowerCase();

  if (oms === 'completed' || status === 'delivered') return 'delivered';
  if (oms === 'out_for_delivery') return 'out_for_delivery';
  if (oms === 'ready_for_collection' || status === 'shipped' || oms.includes('ship')) {
    return order.fulfillment_method === 'store_pickup' ? 'packed' : 'shipped';
  }
  if (
    oms === 'warehouse_accepted' ||
    oms === 'picking' ||
    oms === 'packed' ||
    oms === 'ready_for_pickup'
  ) {
    return 'packed';
  }
  if (oms === 'approved' || status === 'confirmed') return 'confirmed';
  return 'order_placed';
}

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildShipmentFromOrder(order: TrackableOrder): Shipment {
  const current = resolveDeliveryStatus(order);
  const currentIndex = PIPELINE.indexOf(current);
  const orderId = order.order_number ?? 'UNKNOWN';
  const trackingNumber =
    order.tracking_number?.trim() ||
    (order.fulfillment_method === 'store_pickup'
      ? `PICKUP-${orderId}`
      : `JB-${orderId}`);

  const timeline = Array.isArray(order.timeline) ? order.timeline : [];
  const timelineByStatus = new Map(
    timeline.map((entry) => [entry.status.toLowerCase(), entry.created_at]),
  );

  const events: TrackingEvent[] = PIPELINE.map((status, index) => {
    const completed = index <= currentIndex;
    const meta = STATUS_LABELS[status];
    let timestamp: string | null = null;
    if (status === 'order_placed') timestamp = order.created_at;
    else if (completed) {
      timestamp =
        timelineByStatus.get(status) ??
        timeline.find((entry) => entry.status.toLowerCase().includes(status.replace(/_/g, '')))
          ?.created_at ??
        null;
    }

    return {
      status,
      label: meta.label,
      description:
        order.fulfillment_method === 'store_pickup' && status === 'shipped'
          ? 'Ready for collection at the pickup branch.'
          : meta.description,
      timestamp,
      completed,
    };
  });

  const estimatedDelivery =
    order.pickup_date ??
    addDaysIso(order.created_at, order.fulfillment_method === 'store_pickup' ? 0 : 3);

  return {
    orderId,
    trackingNumber,
    carrier:
      order.fulfillment_method === 'store_pickup'
        ? 'Store pickup'
        : 'Joseph Bezzina Delivery',
    status: current,
    estimatedDelivery,
    items: (order.items ?? []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
    events,
  };
}
