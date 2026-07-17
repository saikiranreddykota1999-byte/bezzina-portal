import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import { buildPageMetadata } from '@/lib/seo/metadata';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/search',
    fallbackTitle: 'Search Products | Joseph Bezzina & Co Ltd',
    fallbackDescription: 'Search our marine and industrial product catalogue.',
  });
}

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function SearchResults({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  const catalogueParams: CatalogueSearchParams = {
    q: query || undefined,
  };

  return (
    <ProductsCatalogueSection searchParams={Promise.resolve(catalogueParams)} />
  );
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <SearchHeader searchParams={searchParams} />
      <Suspense fallback={<CatalogueSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchHeader({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">Search results</h1>
      <p className="mt-2 text-slate-600">
        {query
          ? `Showing products matching “${query}”.`
          : 'Enter a search term to find products across our catalogue.'}
      </p>
    </div>
  );
}
