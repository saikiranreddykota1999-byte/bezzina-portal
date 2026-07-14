import { describe, expect, it } from 'vitest';
import {
  getBreadcrumbSchema,
  getOrganizationSchema,
  getProductSchema,
} from '@/lib/structuredData';
import type { Product } from '@/types/product';

describe('structuredData', () => {
  it('builds organization schema with Malta country code', () => {
    const schema = getOrganizationSchema();

    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Joseph Bezzina & Co. Ltd');
    expect(schema.url).toBe('https://jbezzina.store');
    expect(schema.address.addressCountry).toBe('MT');
    expect(schema.telephone).toBe('+356 2122 6647');
  });

  it('builds product schema from product fields', () => {
    const product = {
      id: '1',
      sku: 'SKU-100',
      name: 'Hex Bolt',
      slug: 'hex-bolt',
      description: 'High-tensile hex bolt for industrial use.',
      image_url: '/images/hex-bolt.jpg',
      price: 2.5,
      availability: 'available',
      category: { id: 'c1', name: 'Fasteners', slug: 'fasteners', description: null, sort_order: 1 },
    } as Product;

    const schema = getProductSchema(product);
    const offers = schema.offers as {
      priceCurrency: string;
      availability: string;
    };
    const brand = schema.brand as { name: string };

    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Hex Bolt');
    expect(schema.sku).toBe('SKU-100');
    expect(schema.category).toBe('Fasteners');
    expect(schema.description).toBe('High-tensile hex bolt for industrial use.');
    expect(schema.image).toBe('https://jbezzina.store/images/hex-bolt.jpg');
    expect(offers.priceCurrency).toBe('EUR');
    expect(offers.availability).toBe('https://schema.org/InStock');
    expect(brand.name).toBe('Joseph Bezzina & Co. Ltd');
  });

  it('builds breadcrumb schema with absolute urls', () => {
    const schema = getBreadcrumbSchema(
      [
        { label: 'Products', href: '/products' },
        { label: 'Hex Bolt', href: '/products/hex-bolt' },
      ],
      'https://jbezzina.store',
    );

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].item).toBe('https://jbezzina.store/products');
    expect(schema.itemListElement[1].item).toBe('https://jbezzina.store/products/hex-bolt');
  });
});
