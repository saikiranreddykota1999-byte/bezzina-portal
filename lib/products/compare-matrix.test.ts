import { describe, expect, it } from 'vitest';
import { buildCompareMatrix } from '@/lib/products/compare-matrix';
import type { Product } from '@/types/product';

describe('buildCompareMatrix', () => {
  it('builds rows for shared product fields and technical specs', () => {
    const products = [
      {
        id: '1',
        sku: 'A-1',
        name: 'Bolt',
        slug: 'bolt',
        material: 'Steel',
        standard: 'DIN',
        price: 1.5,
        availability: 'available',
        technical_specs: [{ property: 'Grade', value: '8.8' }],
      },
      {
        id: '2',
        sku: 'B-2',
        name: 'Nut',
        slug: 'nut',
        material: 'Steel',
        standard: null,
        price: null,
        availability: 'special_order',
        technical_specs: [{ property: 'Grade', value: 'A2' }],
      },
    ] as Product[];

    const matrix = buildCompareMatrix(products);
    const labels = matrix.map((row) => row.label);
    expect(labels).toContain('Name');
    expect(labels).toContain('SKU');
    expect(labels).toContain('Grade');
    const grade = matrix.find((row) => row.label === 'Grade');
    expect(grade?.values).toEqual(['8.8', 'A2']);
  });
});
