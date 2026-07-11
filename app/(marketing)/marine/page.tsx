import { Suspense } from 'react';
import ProductCatalogue from '@/components/products/ProductCatalogue';
import { getAllProducts, getCategoriesByDivision } from '@/services/product.service';

export const metadata = {
  title: 'Marine Supplies | Joseph Bezzina & Co Ltd',
  description:
    'Full marine supplies catalogue — anchors, pumps, safety equipment, navigation, and more.',
};

export default async function MarinePage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesByDivision('marine'),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Marine Supplies</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Quality products for vessel maintenance, ship chandlery, and marine operations.
          Browse our full A–Z marine catalogue or contact us for specialist enquiries.
        </p>
      </div>
      <Suspense fallback={<p className="text-slate-600">Loading catalogue…</p>}>
        <ProductCatalogue
          products={products}
          categories={categories}
          division="marine"
        />
      </Suspense>
    </main>
  );
}
