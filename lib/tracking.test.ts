import { describe, expect, it } from 'vitest';
import { buildShipmentFromOrder, resolveDeliveryStatus } from '@/lib/tracking';

describe('resolveDeliveryStatus', () => {
  it('maps OMS and order status to delivery stages', () => {
    expect(
      resolveDeliveryStatus({
        order_number: 'JB-1',
        tracking_number: null,
        status: 'confirmed',
        oms_status: 'approved',
        fulfillment_method: 'delivery',
        created_at: '2026-07-01T10:00:00Z',
      }),
    ).toBe('confirmed');

    expect(
      resolveDeliveryStatus({
        order_number: 'JB-1',
        tracking_number: 'T1',
        status: 'shipped',
        oms_status: 'out_for_delivery',
        fulfillment_method: 'delivery',
        created_at: '2026-07-01T10:00:00Z',
      }),
    ).toBe('out_for_delivery');
  });
});

describe('buildShipmentFromOrder', () => {
  it('builds a shipment with completed events up to current status', () => {
    const shipment = buildShipmentFromOrder({
      order_number: 'JB-2026-1001',
      tracking_number: 'MT123',
      status: 'confirmed',
      oms_status: 'packed',
      fulfillment_method: 'delivery',
      created_at: '2026-07-01T10:00:00Z',
      items: [{ name: 'Bolt', quantity: 10 }],
    });

    expect(shipment.trackingNumber).toBe('MT123');
    expect(shipment.status).toBe('packed');
    expect(shipment.items).toHaveLength(1);
    expect(shipment.events.find((e) => e.status === 'packed')?.completed).toBe(true);
    expect(shipment.events.find((e) => e.status === 'delivered')?.completed).toBe(false);
  });
});
