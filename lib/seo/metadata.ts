import type { Metadata } from 'next';
import { company } from '@/config/company';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-url';
import { getSeoForPath } from '@/services/cms.service';

type SeoOptions = {
  path: string;
  fallbackTitle: string;
  fallbackDescription?: string;
  /** Absolute or site-relative image for OG/Twitter. */
  fallbackImage?: string | null;
  /** Open Graph type — use `product` on product detail pages. */
  ogType?: 'website' | 'article' | 'product';
  /** Override robots (e.g. noindex for private surfaces). */
  robots?: Metadata['robots'];
};

function resolveOgImage(url: string | null | undefined): string {
  if (url?.trim()) {
    return toAbsoluteUrl(url.trim());
  }
  return toAbsoluteUrl(company.logoUrl);
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path.replace(/\/$/, '') || '/' : `/${path.replace(/\/$/, '')}`;
}

/**
 * Builds absolute canonical + social metadata for marketing pages.
 * CMS SEO overrides title/description/keywords/image/canonical when present.
 */
export async function buildPageMetadata({
  path,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  ogType = 'website',
  robots,
}: SeoOptions): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);
  const seo = await getSeoForPath(normalizedPath);

  const title = seo?.page_title ?? fallbackTitle;
  const description = seo?.meta_description ?? fallbackDescription ?? company.tagline;
  const canonicalPath = seo?.canonical_url?.trim()
    ? seo.canonical_url.trim()
    : normalizedPath === '/'
      ? siteUrl
      : `${siteUrl}${normalizedPath}`;
  const canonical = canonicalPath.startsWith('http')
    ? canonicalPath
    : toAbsoluteUrl(canonicalPath);

  const ogImage = resolveOgImage(seo?.og_image_url ?? fallbackImage);
  const keywords = seo?.keywords
    ?.split(',')
    .map((k: string) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    authors: [{ name: company.name }],
    creator: company.name,
    publisher: company.name,
    category: 'Industrial Supplies',
    robots: robots ?? seo?.robots ?? { index: true, follow: true },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: company.name,
      locale: 'en_MT',
      type: ogType === 'product' ? 'website' : ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Shared root metadata defaults (metadataBase, templates, default social). */
export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const defaultImage = toAbsoluteUrl(company.logoUrl);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: company.seo.title,
      template: `%s | ${company.shortName}`,
    },
    description: company.seo.description,
    applicationName: company.name,
    authors: [{ name: company.name, url: siteUrl }],
    creator: company.name,
    publisher: company.name,
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_MT',
      url: siteUrl,
      siteName: company.name,
      title: company.seo.title,
      description: company.seo.description,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: company.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: company.seo.title,
      description: company.seo.description,
      images: [defaultImage],
    },
    icons: {
      icon: company.logoUrl,
    },
  };
}
