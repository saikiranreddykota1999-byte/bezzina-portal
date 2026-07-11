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

export const vacancySchema = z.object({
  title: z.string().trim().min(1).max(256),
  department: z.string().trim().min(1).max(128),
  location: z.string().trim().min(1).max(128).default('Malta'),
  short_description: z.string().trim().min(10).max(500),
  description: z.string().trim().min(10),
  requirements: z.string().trim().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

/** @deprecated Use vacancySchema */
export const jobPostingSchema = vacancySchema;

export const jobApplicationSchema = z.object({
  vacancyId: z.string().uuid().optional(),
  jobPostingId: z.string().uuid().optional(),
  fullName: z.string().trim().min(2).max(128),
  email: z.string().trim().email(),
  phone: z.string().trim().max(32).optional(),
  linkedinUrl: z.string().trim().url().optional().or(z.literal('')),
  coverLetter: z.string().trim().max(5000).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type VacancyInput = z.infer<typeof vacancySchema>;
/** @deprecated Use VacancyInput */
export type JobPostingInput = VacancyInput;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(128),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().trim().max(2000).optional(),
  division: z.enum(['marine', 'industrial']).nullable(),
  parent_id: z.string().uuid().nullable(),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
