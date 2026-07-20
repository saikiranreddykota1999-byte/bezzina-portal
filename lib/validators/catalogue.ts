import { z } from 'zod';

const inventoryStatus = z.enum([
  'available', 'limited_stock', 'special_order', 'made_to_order',
  'coming_soon', 'discontinued', 'out_of_stock',
]);

const technicalSpecRow = z.object({
  property: z.string().trim().min(1).max(128),
  value: z.string().trim().min(1).max(512),
});

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  name: z.string().trim().min(1, 'Name is required').max(256),
  slug: z.string().trim().min(1).max(256).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().trim().max(5000).optional(),
  long_description: z.string().trim().max(20000).optional(),
  applications: z.string().trim().max(5000).optional(),
  category_id: z.string().uuid('Select a category'),
  price: z.coerce.number().min(0).nullable().optional(),
  unit: z.string().trim().min(1).default('each'),
  in_stock: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  publish_status: z.enum(['draft', 'published']).default('published'),
  material: z.string().trim().max(128).optional(),
  standard: z.string().trim().max(128).optional(),
  thread_type: z.string().trim().max(128).optional(),
  grade: z.string().trim().max(128).optional(),
  length_mm: z.coerce.number().min(0).nullable().optional(),
  diameter_mm: z.coerce.number().min(0).nullable().optional(),
  weight_kg: z.coerce.number().min(0).nullable().optional(),
  availability: inventoryStatus.default('available'),
  video_url: z.string().trim().url().optional().or(z.literal('')),
  youtube_url: z.string().trim().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  fast_selling: z.boolean().default(false),
  upcoming: z.boolean().default(false),
  future_product: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  clearance: z.boolean().default(false),
  recommended: z.boolean().default(false),
  marine_grade: z.boolean().default(false),
  industrial_grade: z.boolean().default(false),
  best_seller: z.boolean().default(false),
  most_viewed: z.boolean().default(false),
  recently_added: z.boolean().default(false),
  discount_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  search_keywords: z.string().trim().max(500).optional(),
  internal_notes: z.string().trim().max(5000).optional(),
  seo_title: z.string().trim().max(256).optional(),
  seo_description: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  technical_specs: z.array(technicalSpecRow).optional(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(128),
  sku: z.string().trim().min(1).max(64),
  availability: inventoryStatus.default('available'),
  unit: z.string().trim().min(1).default('each'),
  weight_kg: z.coerce.number().min(0).nullable().optional(),
  specification: z.string().trim().max(2000).optional(),
  image_url: z.string().trim().url().optional().or(z.literal('')),
  document_url: z.string().trim().url().optional().or(z.literal('')),
  document_label: z.string().trim().max(128).optional(),
  in_stock: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().min(0).nullable().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const productDocumentSchema = z.object({
  label: z.string().trim().min(1).max(128),
  doc_type: z.enum(['pdf', 'datasheet', 'sds', 'manual', 'catalogue', 'other']),
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
  turnstileToken: z.string().trim().max(2048).optional().or(z.literal('')),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductDocumentInput = z.infer<typeof productDocumentSchema>;
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
