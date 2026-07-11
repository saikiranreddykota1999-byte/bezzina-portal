import { Suspense } from 'react';
import ProductCatalogue from '@/components/products/ProductCatalogue';
import { getAllProducts, getCategories } from '@/services/product.service';

export const metadata = {
  title: 'Industrial Equipment | Joseph Bezzina & Co Ltd',
  description:
    'Full industrial equipment catalogue — tools, hydraulics, electrical, safety, and more.',
};

export const revalidate = 60;

export default async function IndustrialPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Industrial Equipment</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Reliable industrial solutions for engineering teams, workshops, and commercial
          facilities. Browse our full A–Z industrial catalogue.
        </p>
      </div>
      <Suspense fallback={<p className="text-slate-600">Loading catalogue…</p>}>
        <ProductCatalogue
          products={products}
          categories={categories}
          division="industrial"
        />
      </Suspense>
    </main>
  );
}
