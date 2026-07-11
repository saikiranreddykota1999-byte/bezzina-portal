import { z } from 'zod';

export const fulfillmentMethodSchema = z.enum(['delivery', 'store_pickup']);

export const pickupSelectionSchema = z.object({
  locationId: z.string().uuid('Select a pickup branch'),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a pickup date'),
  pickupTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Select a pickup time'),
});

export const checkoutStateSchema = z.discriminatedUnion('fulfillmentMethod', [
  z.object({
    fulfillmentMethod: z.literal('delivery'),
  }),
  z.object({
    fulfillmentMethod: z.literal('store_pickup'),
    pickup: pickupSelectionSchema,
  }),
]);

export const pickupLocationSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  line1: z.string().trim().min(3, 'Address line is required'),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, 'City is required'),
  postal_code: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Invalid email').optional().nullable().or(z.literal('')),
  instructions: z.string().trim().optional().nullable(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

export const pickupOpeningHourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  opens_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  closes_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  is_closed: z.boolean(),
});

export const pickupTimeSlotSchema = z.object({
  slot_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  label: z.string().trim().min(3),
  max_capacity: z.number().int().min(1).max(100),
  is_active: z.boolean(),
});

export const pickupUnavailableDateSchema = z.object({
  closed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().optional().nullable(),
});

export const placeOrderSchema = z.discriminatedUnion('fulfillmentMethod', [
  z.object({
    fulfillmentMethod: z.literal('delivery'),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          slug: z.string().min(1),
          name: z.string().min(1),
          sku: z.string().min(1),
          price: z.number().nullable(),
          unit: z.string().min(1),
          quantity: z.number().int().min(1),
        }),
      )
      .min(1),
  }),
  z.object({
    fulfillmentMethod: z.literal('store_pickup'),
    pickup: pickupSelectionSchema,
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          slug: z.string().min(1),
          name: z.string().min(1),
          sku: z.string().min(1),
          price: z.number().nullable(),
          unit: z.string().min(1),
          quantity: z.number().int().min(1),
        }),
      )
      .min(1),
  }),
]);

export const updatePickupStatusSchema = z.object({
  orderId: z.string().uuid(),
  pickupStatus: z.enum(['ready_for_pickup', 'collected']),
});

export type CheckoutStateInput = z.infer<typeof checkoutStateSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
