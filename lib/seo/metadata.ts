import type { Metadata } from 'next';
import { getSeoForPath } from '@/services/cms.service';
import { company } from '@/config/company';

type SeoOptions = {
  path: string;
  fallbackTitle: string;
  fallbackDescription?: string;
};

export async function buildPageMetadata({
  path,
  fallbackTitle,
  fallbackDescription,
}: SeoOptions): Promise<Metadata> {
  const seo = await getSeoForPath(path);
  const title = seo?.page_title ?? fallbackTitle;
  const description = seo?.meta_description ?? fallbackDescription ?? company.tagline;

  return {
    title,
    description,
    keywords: seo?.keywords?.split(',').map((k: string) => k.trim()),
    robots: seo?.robots ?? undefined,
    alternates: seo?.canonical_url ? { canonical: seo.canonical_url } : undefined,
    openGraph: {
      title,
      description,
      images: seo?.og_image_url ? [{ url: seo.og_image_url }] : undefined,
      type: 'website',
      siteName: company.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: seo?.og_image_url ? [seo.og_image_url] : undefined,
    },
  };
}
