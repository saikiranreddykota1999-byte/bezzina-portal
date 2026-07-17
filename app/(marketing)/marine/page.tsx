import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageBreadcrumbs } from '@/lib/breadcrumbs';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getCollectionPageSchema } from '@/lib/structuredData';

const PAGE_TITLE = 'Marine Supplies | Joseph Bezzina & Co Ltd';
const PAGE_DESCRIPTION =
  'Full marine supplies catalogue — anchors, pumps, safety equipment, navigation, and more.';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/marine',
    fallbackTitle: PAGE_TITLE,
    fallbackDescription: PAGE_DESCRIPTION,
  });
}

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default function MarinePage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <JsonLd
        data={[
          getCollectionPageSchema({
            name: 'Marine Supplies',
            description: PAGE_DESCRIPTION,
            path: '/marine',
          }),
          getBreadcrumbSchema(
            buildPageBreadcrumbs([
              { label: 'Products', href: '/products' },
              { label: 'Marine Supplies', href: '/marine' },
            ]),
          ),
        ]}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Marine Supplies</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Quality products for vessel maintenance, ship chandlery, and marine operations.
          Browse our full A–Z marine catalogue or contact us for specialist enquiries.
        </p>
      </div>

      <Suspense fallback={<CatalogueSkeleton />}>
        <ProductsCatalogueSection searchParams={searchParams} division="marine" />
      </Suspense>
    </div>
  );
}
