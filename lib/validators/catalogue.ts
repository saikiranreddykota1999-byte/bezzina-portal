import { z } from 'zod';

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  name: z.string().trim().min(1, 'Name is required').max(256),
  slug: z.string().trim().min(1).max(256).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().trim().max(5000).optional(),
  category_id: z.string().uuid('Select a category'),
  price: z.coerce.number().min(0).nullable().optional(),
  unit: z.string().trim().min(1).default('each'),
  in_stock: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  material: z.string().trim().max(128).optional(),
  standard: z.string().trim().max(128).optional(),
});

export const jobPostingSchema = z.object({
  title: z.string().trim().min(1).max(256),
  department: z.string().trim().min(1).max(128),
  location: z.string().trim().min(1).max(128).default('Malta'),
  description: z.string().trim().min(10),
  requirements: z.string().trim().optional(),
  is_active: z.boolean().default(true),
});

export const jobApplicationSchema = z.object({
  jobPostingId: z.string().uuid().optional(),
  fullName: z.string().trim().min(2).max(128),
  email: z.string().trim().email(),
  phone: z.string().trim().max(32).optional(),
  linkedinUrl: z.string().trim().url().optional().or(z.literal('')),
  coverLetter: z.string().trim().max(5000).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type JobPostingInput = z.infer<typeof jobPostingSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
