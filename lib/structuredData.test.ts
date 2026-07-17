import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '@/components/seo/json-ld';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getOrganizationSchema,
  getProductSchema,
  getWebSiteSchema,
} from '@/lib/structuredData';
import type { Product } from '@/types/product';

describe('structuredData', () => {
  it('builds organization schema with Malta country code', () => {
    const schema = getOrganizationSchema();

    expect(schema['@type']).toBe('Organization');
    expect(schema['@id']).toContain('#organization');
    expect(schema.name).toBe('Joseph Bezzina & Co. Ltd');
    expect(schema.url).toBe('https://jbezzina.store');
    expect(schema.address.addressCountry).toBe('MT');
    expect(schema.telephone).toBe('+356 2122 6647');
    expect(schema.contactPoint).toHaveLength(1);
  });

  it('builds website schema with search action', () => {
    const schema = getWebSiteSchema();

    expect(schema['@type']).toBe('WebSite');
    expect(schema.potentialAction['@type']).toBe('SearchAction');
    expect(schema.publisher).toEqual({ '@id': 'https://jbezzina.store/#organization' });
  });

  it('builds product schema from product fields', () => {
    const product = {
      id: '1',
      sku: 'SKU-100',
      name: 'Hex Bolt',
      slug: 'hex-bolt',
      description: 'High-tensile hex bolt for industrial use.',
      image_url: '/images/hex-bolt.jpg',
      images: [
        {
          id: 'img-2',
          product_id: '1',
          url: '/images/hex-bolt-alt.jpg',
          thumbnail_url: null,
          sort_order: 1,
          is_primary: false,
        },
      ],
      price: 2.5,
      availability: 'available',
      technical_specs: [{ property: 'Tensile Strength', value: '800 MPa' }],
      category: { id: 'c1', name: 'Fasteners', slug: 'fasteners', description: null, sort_order: 1 },
    } as Product;

    const schema = getProductSchema(product);
    const offers = schema.offers as {
      priceCurrency: string;
      availability: string;
      price: string;
    };
    const brand = schema.brand as { name: string };
    const additionalProperty = schema.additionalProperty as Array<{ name: string; value: string }>;

    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Hex Bolt');
    expect(schema.sku).toBe('SKU-100');
    expect(schema.category).toBe('Fasteners');
    expect(schema.description).toBe('High-tensile hex bolt for industrial use.');
    expect(schema.image).toEqual([
      'https://jbezzina.store/images/hex-bolt.jpg',
      'https://jbezzina.store/images/hex-bolt-alt.jpg',
    ]);
    expect(additionalProperty).toEqual(
      expect.arrayContaining([{ '@type': 'PropertyValue', name: 'Tensile Strength', value: '800 MPa' }]),
    );
    expect(offers.priceCurrency).toBe('EUR');
    expect(offers.price).toBe('2.50');
    expect(offers.availability).toBe('https://schema.org/InStock');
    expect(brand.name).toBe('Joseph Bezzina & Co. Ltd');
  });

  it('builds product offer without list price for RFQ items', () => {
    const product = {
      id: '2',
      sku: 'SKU-200',
      name: 'Custom Fitting',
      slug: 'custom-fitting',
      description: null,
      image_url: null,
      price: null,
      availability: 'special_order',
    } as Product;

    const schema = getProductSchema(product);
    const offers = schema.offers as { description?: string; availability: string };

    expect(offers.description).toMatch(/quote/i);
    expect(offers.availability).toBe('https://schema.org/PreOrder');
    expect('price' in offers).toBe(false);
  });

  it('builds breadcrumb schema with absolute urls', () => {
    const schema = getBreadcrumbSchema(
      [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Hex Bolt', href: '/products/hex-bolt' },
      ],
      'https://jbezzina.store',
    );

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].item).toBe('https://jbezzina.store/');
    expect(schema.itemListElement[1].item).toBe('https://jbezzina.store/products');
    expect(schema.itemListElement[2].item).toBe('https://jbezzina.store/products/hex-bolt');
  });

  it('builds collection page schema', () => {
    const schema = getCollectionPageSchema({
      name: 'Marine Supplies',
      description: 'Marine catalogue',
      path: '/marine',
    });

    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.url).toBe('https://jbezzina.store/marine');
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets to prevent XSS breakouts', () => {
    const html = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c');
  });
});
