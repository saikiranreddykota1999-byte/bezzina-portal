import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  formattedAddress: z.string().trim().min(5, 'Select or enter a delivery address'),
  line1: z.string().trim().min(3, 'Address line is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  postalCode: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  lat: z.number(),
  lng: z.number(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().nullable(),
  unit: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const demoPaymentSchema = z.object({
  method: z.literal('demo'),
  cardholderName: z.string().trim().min(2, 'Cardholder name is required'),
  cardLast4: z.string().regex(/^\d{4}$/, 'Enter last 4 digits'),
});

export const stripePaymentSchema = z.object({
  method: z.literal('stripe'),
  paymentIntentId: z.string().min(1, 'Payment reference is required'),
});

export const cashOnPickupPaymentSchema = z.object({
  method: z.literal('cash_on_pickup'),
});

export const paymentDetailsSchema = z.discriminatedUnion('method', [
  demoPaymentSchema,
  stripePaymentSchema,
  cashOnPickupPaymentSchema,
]);
