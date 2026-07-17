import type { z } from 'zod';
import { productFormSchema } from '@/lib/validators/catalogue';

type ProductFormInput = z.infer<typeof productFormSchema>;

/**
 * Maps validated product form data to the DB write shape used by create/update.
 */
export function toProductWritePayload(
  parsed: ProductFormInput,
  mode: 'create' | 'update',
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    ...parsed,
    description: parsed.description ?? null,
    long_description: parsed.long_description ?? null,
    applications: parsed.applications ?? null,
    price: parsed.price ?? null,
    material: parsed.material ?? null,
    standard: parsed.standard ?? null,
    thread_type: parsed.thread_type ?? null,
    grade: parsed.grade ?? null,
    length_mm: parsed.length_mm ?? null,
    diameter_mm: parsed.diameter_mm ?? null,
    weight_kg: parsed.weight_kg ?? null,
    video_url: parsed.video_url || null,
    youtube_url: parsed.youtube_url || null,
    technical_specs: parsed.technical_specs ?? [],
    availability: parsed.availability ?? 'available',
    search_keywords: parsed.search_keywords ?? null,
    internal_notes: parsed.internal_notes ?? null,
    seo_title: parsed.seo_title ?? null,
    seo_description: parsed.seo_description ?? null,
    tags: parsed.tags ?? null,
    discount_percent: parsed.discount_percent ?? null,
  };

  if (mode === 'create') {
    return {
      ...base,
      featured: parsed.featured ?? false,
      fast_selling: parsed.fast_selling ?? false,
      upcoming: parsed.upcoming ?? false,
      future_product: parsed.future_product ?? false,
      new_arrival: parsed.new_arrival ?? false,
      clearance: parsed.clearance ?? false,
      recommended: parsed.recommended ?? false,
      marine_grade: parsed.marine_grade ?? false,
      industrial_grade: parsed.industrial_grade ?? false,
      best_seller: parsed.best_seller ?? false,
      most_viewed: parsed.most_viewed ?? false,
      recently_added: parsed.recently_added ?? false,
      publish_status: parsed.publish_status ?? 'published',
    };
  }

  return {
    ...base,
    featured: parsed.featured,
    fast_selling: parsed.fast_selling,
    upcoming: parsed.upcoming,
    future_product: parsed.future_product,
    new_arrival: parsed.new_arrival,
    clearance: parsed.clearance,
    recommended: parsed.recommended,
    marine_grade: parsed.marine_grade,
    industrial_grade: parsed.industrial_grade,
    best_seller: parsed.best_seller,
    most_viewed: parsed.most_viewed,
    recently_added: parsed.recently_added,
  };
}
