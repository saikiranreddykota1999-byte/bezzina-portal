import { Suspense } from 'react';
import { ProductsCatalogueSection } from '@/components/products/products-catalogue-section';
import { CatalogueSkeleton } from '@/components/products/catalogue-skeleton';
import type { CatalogueSearchParams } from '@/lib/catalogue-params';

export const metadata = {
  title: 'Marine Supplies | Joseph Bezzina & Co Ltd',
  description:
    'Full marine supplies catalogue — anchors, pumps, safety equipment, navigation, and more.',
};

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default function MarinePage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
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
    </main>
  );
}
