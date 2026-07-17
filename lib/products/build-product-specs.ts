import type { Product, ProductVariant, TechnicalSpecRow } from '@/types/product';

export type SpecRow = { label: string; value: string };

export function buildProductSpecs(
  product: Product,
  selectedVariant?: ProductVariant | null,
): SpecRow[] {
  const specs: SpecRow[] = [{ label: 'SKU', value: selectedVariant?.sku ?? product.sku }];
  if (product.category?.name) specs.push({ label: 'Category', value: product.category.name });

  if (Array.isArray(product.technical_specs)) {
    product.technical_specs.forEach((row: TechnicalSpecRow) => {
      if (row.property && row.value) specs.push({ label: row.property, value: row.value });
    });
  } else if (product.technical_specs && typeof product.technical_specs === 'object') {
    Object.entries(product.technical_specs).forEach(([k, v]) =>
      specs.push({ label: k, value: String(v) }),
    );
  }

  if (selectedVariant?.specification) {
    specs.push({ label: 'Selected Size', value: selectedVariant.specification });
  }
  if (product.material) specs.push({ label: 'Material', value: product.material });
  if (product.standard) specs.push({ label: 'Standard', value: product.standard });
  if (product.thread_type) specs.push({ label: 'Thread', value: product.thread_type });
  if (product.diameter_mm != null) specs.push({ label: 'Diameter', value: `${product.diameter_mm} mm` });
  if (product.length_mm != null) specs.push({ label: 'Length', value: `${product.length_mm} mm` });
  if (product.grade) specs.push({ label: 'Grade', value: product.grade });
  if (product.weight_kg != null) specs.push({ label: 'Weight', value: `${product.weight_kg} kg` });

  return specs;
}
