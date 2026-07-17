import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageBreadcrumbs } from '@/lib/breadcrumbs';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getCollectionPageSchema } from '@/lib/structuredData';

const PAGE_TITLE = 'Product Catalogue | Joseph Bezzina & Co Ltd';
const PAGE_DESCRIPTION = 'Browse our full range of marine and industrial products.';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/products',
    fallbackTitle: PAGE_TITLE,
    fallbackDescription: PAGE_DESCRIPTION,
  });
}

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <JsonLd
        data={[
          getCollectionPageSchema({
            name: 'Product Catalogue',
            description: PAGE_DESCRIPTION,
            path: '/products',
          }),
          getBreadcrumbSchema(
            buildPageBreadcrumbs([{ label: 'Products', href: '/products' }]),
          ),
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Product Catalogue</h1>
        <p className="mt-2 text-slate-600">
          Smart search, filters, and sorting across our full product range.
        </p>
      </div>

      <Suspense fallback={<CatalogueSkeleton />}>
        <ProductsCatalogueSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
