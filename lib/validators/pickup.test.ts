import { describe, expect, it } from 'vitest';
import {
  checkoutStateSchema,
  pickupSelectionSchema,
  placeOrderSchema,
} from '@/lib/validators/pickup';

describe('pickup validators', () => {
  it('validates pickup selection', () => {
    const result = pickupSelectionSchema.safeParse({
      locationId: '550e8400-e29b-41d4-a716-446655440000',
      pickupDate: '2026-07-15',
      pickupTime: '10:00',
    });

    expect(result.success).toBe(true);
  });

  it('requires pickup details for store pickup checkout state', () => {
    const result = checkoutStateSchema.safeParse({
      fulfillmentMethod: 'store_pickup',
      pickup: {
        locationId: '550e8400-e29b-41d4-a716-446655440000',
        pickupDate: '2026-07-15',
        pickupTime: '10:00:00',
      },
    });

    expect(result.success).toBe(true);
  });

  it('accepts delivery orders without pickup data', () => {
    const result = placeOrderSchema.safeParse({
      fulfillmentMethod: 'delivery',
      deliveryAddress: {
        formattedAddress: '123 Main St, Valletta, Malta',
        line1: '123 Main St',
        city: 'Valletta',
        postalCode: 'VLT 1234',
        country: 'Malta',
        lat: 35.8989,
        lng: 14.5146,
      },
      payment: {
        method: 'demo',
        cardholderName: 'Test User',
        cardLast4: '4242',
      },
      items: [
        {
          productId: 'prod-1',
          slug: 'bolt',
          name: 'Bolt',
          sku: 'JB-001',
          price: 10,
          unit: 'each',
          quantity: 1,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
