import { z } from 'zod';
import {
  ONLINE_ORDER_STATUSES,
  STORE_ORDER_STATUSES,
  WAREHOUSE_REJECT_REASONS,
} from '@/config/oms';

const omsStatusSchema = z.union([
  z.enum(ONLINE_ORDER_STATUSES),
  z.enum(STORE_ORDER_STATUSES),
]);

export const updateOmsStatusSchema = z.object({
  orderId: z.string().uuid(),
  toStatus: omsStatusSchema,
  note: z.string().max(500).optional(),
  rejectionReason: z.enum(WAREHOUSE_REJECT_REASONS).optional(),
  rejectionNote: z.string().max(500).optional(),
});

export const walkInOrderLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1).max(9999),
  unitPrice: z.number().min(0).nullable().optional(),
});

export const createWalkInOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().max(50).optional(),
  customerEmail: z.string().email().optional(),
  customerCompany: z.string().max(200).optional(),
  warehouseId: z.string().uuid().optional(),
  items: z.array(walkInOrderLineSchema).min(1),
  note: z.string().max(500).optional(),
});

export const barcodeLookupSchema = z.object({
  barcode: z.string().min(1).max(128),
});

export const assignOrderSchema = z.object({
  orderId: z.string().uuid(),
  salesmanId: z.string().uuid().nullable().optional(),
  driverId: z.string().uuid().nullable().optional(),
});

export const reportQuerySchema = z.object({
  reportType: z.enum(['sales', 'inventory', 'warehouse', 'customers', 'salesman', 'delivery', 'audit']),
  period: z.enum(['daily', 'weekly', 'monthly']),
});

export type UpdateOmsStatusInput = z.infer<typeof updateOmsStatusSchema>;
export type CreateWalkInOrderInput = z.infer<typeof createWalkInOrderSchema>;
