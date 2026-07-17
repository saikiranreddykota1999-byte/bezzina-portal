import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageBreadcrumbs } from '@/lib/breadcrumbs';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getCollectionPageSchema } from '@/lib/structuredData';

const PAGE_TITLE = 'Industrial Equipment | Joseph Bezzina & Co Ltd';
const PAGE_DESCRIPTION =
  'Full industrial equipment catalogue — tools, hydraulics, electrical, safety, and more.';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/industrial',
    fallbackTitle: PAGE_TITLE,
    fallbackDescription: PAGE_DESCRIPTION,
  });
}

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default function IndustrialPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <JsonLd
        data={[
          getCollectionPageSchema({
            name: 'Industrial Equipment',
            description: PAGE_DESCRIPTION,
            path: '/industrial',
          }),
          getBreadcrumbSchema(
            buildPageBreadcrumbs([
              { label: 'Products', href: '/products' },
              { label: 'Industrial Equipment', href: '/industrial' },
            ]),
          ),
        ]}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Industrial Equipment</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Reliable industrial solutions for engineering teams, workshops, and commercial
          facilities. Browse our full A–Z industrial catalogue.
        </p>
      </div>

      <Suspense fallback={<CatalogueSkeleton />}>
        <ProductsCatalogueSection searchParams={searchParams} division="industrial" />
      </Suspense>
    </div>
  );
}
