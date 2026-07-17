import type { Product, TechnicalSpecRow } from '@/types/product';
import type { VariantDraft } from '@/components/admin/product-variants-section';

export function parseProductTechnicalSpecs(product?: Product): TechnicalSpecRow[] {
  if (!product?.technical_specs) return [];
  if (Array.isArray(product.technical_specs)) return product.technical_specs;
  return Object.entries(product.technical_specs).map(([property, value]) => ({
    property,
    value,
  }));
}

export function toProductVariantDraft(
  variant: NonNullable<Product['variants']>[number],
): VariantDraft {
  const { id, product_id, ...rest } = variant;
  void product_id;
  return id ? { ...rest, id } : rest;
}
