import { formatAvailabilityLabel, formatCataloguePrice } from '@/lib/pricing';
import type { Product, TechnicalSpecRow } from '@/types/product';

export type CompareRow = {
  label: string;
  values: (string | null)[];
};

function getTechnicalSpecValue(product: Product, property: string): string | null {
  if (Array.isArray(product.technical_specs)) {
    const row = product.technical_specs.find(
      (entry: TechnicalSpecRow) => entry.property === property,
    );
    return row?.value ?? null;
  }
  if (product.technical_specs && typeof product.technical_specs === 'object') {
    const value = product.technical_specs[property];
    return value != null ? String(value) : null;
  }
  return null;
}

export function collectTechnicalSpecProperties(products: Product[]): string[] {
  const properties = new Set<string>();
  for (const product of products) {
    if (Array.isArray(product.technical_specs)) {
      product.technical_specs.forEach((row) => {
        if (row.property) properties.add(row.property);
      });
    } else if (product.technical_specs && typeof product.technical_specs === 'object') {
      Object.keys(product.technical_specs).forEach((key) => properties.add(key));
    }
  }
  return Array.from(properties).sort((a, b) => a.localeCompare(b));
}

export function buildCompareMatrix(products: Product[]): CompareRow[] {
  if (products.length === 0) return [];

  const specProperties = collectTechnicalSpecProperties(products);

  const rows: CompareRow[] = [
    { label: 'Name', values: products.map((p) => p.name) },
    { label: 'SKU', values: products.map((p) => p.sku) },
    {
      label: 'Availability',
      values: products.map((p) => formatAvailabilityLabel(p.availability, p.in_stock)),
    },
    {
      label: 'Price',
      values: products.map((p) => formatCataloguePrice(p.price) ?? 'Request quote'),
    },
    { label: 'Material', values: products.map((p) => p.material) },
    { label: 'Standard', values: products.map((p) => p.standard) },
    ...specProperties.map((property) => ({
      label: property,
      values: products.map((p) => getTechnicalSpecValue(p, property)),
    })),
  ];

  return rows;
}
