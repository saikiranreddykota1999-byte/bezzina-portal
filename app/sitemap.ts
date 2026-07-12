import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/services/product.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bezzina.com.mt';
  const products = await getAllProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/marine`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/industrial`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/quote`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/careers`, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
