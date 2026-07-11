import { describe, expect, it } from 'vitest';
import { quickSearchProducts } from './product-search';
import type { Product } from '@/types/product';

const sampleProducts: Product[] = [
  {
    id: '1',
    sku: 'MS-ANCHOR-01',
    name: 'Hall Anchor',
    slug: 'hall-anchor',
    description: null,
    category_id: null,
    brand_id: null,
    image_url: null,
    material: 'Steel',
    standard: null,
    thread_type: null,
    length_mm: null,
    diameter_mm: null,
    grade: null,
    price: 1,
    unit: 'each',
    in_stock: true,
    stock_quantity: 10,
    is_active: true,
    featured: false,
    fast_selling: false,
    upcoming: false,
    future_product: false,
    discount_percent: null,
    tags: ['marine'],
    seo_title: null,
    seo_description: null,
  },
  {
    id: '2',
    sku: 'IE-MOTOR-02',
    name: 'AC Motors',
    slug: 'ac-motors',
    description: null,
    category_id: null,
    brand_id: null,
    image_url: null,
    material: null,
    standard: null,
    thread_type: null,
    length_mm: null,
    diameter_mm: null,
    grade: null,
    price: 1,
    unit: 'each',
    in_stock: true,
    stock_quantity: 5,
    is_active: true,
    featured: false,
    fast_selling: false,
    upcoming: false,
    future_product: false,
    discount_percent: null,
    tags: null,
    seo_title: null,
    seo_description: null,
  },
];

describe('quickSearchProducts', () => {
  it('returns matches by name', () => {
    const hits = quickSearchProducts(sampleProducts, 'anchor');
    expect(hits).toHaveLength(1);
    expect(hits[0]?.name).toBe('Hall Anchor');
  });

  it('returns matches by sku', () => {
    const hits = quickSearchProducts(sampleProducts, 'motor');
    expect(hits).toHaveLength(1);
    expect(hits[0]?.sku).toBe('IE-MOTOR-02');
  });

  it('returns empty for blank query', () => {
    expect(quickSearchProducts(sampleProducts, '   ')).toEqual([]);
  });
});
