import { Suspense } from 'react';
import { getAllProducts, getCategories } from '@/services/product.service';
import ProductCatalogue from '@/components/products/ProductCatalogue';
import { ProductGridSkeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Product Catalogue | Joseph Bezzina & Co Ltd',
  description: 'Browse our full range of marine and industrial products.',
};

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Product Catalogue</h1>
        <p className="mt-2 text-slate-600">
          Smart search, filters, and sorting across our full product range.
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductCatalogue products={products} categories={categories} />
      </Suspense>
    </main>
  );
}
