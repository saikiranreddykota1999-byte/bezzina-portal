import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';

export const metadata = {
  title: 'Product Catalogue | Joseph Bezzina & Co Ltd',
  description: 'Browse our full range of marine and industrial products.',
};

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Product Catalogue</h1>
        <p className="mt-2 text-slate-600">
          Smart search, filters, and sorting across our full product range.
        </p>
      </div>

      <Suspense fallback={<CatalogueSkeleton />}>
        <ProductsCatalogueSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
