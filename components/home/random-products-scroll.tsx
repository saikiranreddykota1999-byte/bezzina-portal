import Link from 'next/link';
import { getRandomProducts } from '@/services/product.service';
import { ProductSlider } from '@/components/home/product-slider';

export async function RandomProductsScroll() {
  let products: Awaited<ReturnType<typeof getRandomProducts>> = [];
  let loadError: string | null = null;

  try {
    products = await getRandomProducts(12);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load products';
  }

  return (
    <section
      className="border-y border-slate-200 bg-slate-50 py-14"
      aria-labelledby="home-products-scroll-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Product spotlight
            </p>
            <h2
              id="home-products-scroll-title"
              className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl"
            >
              Explore our catalogue
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              A rotating selection from our marine and industrial range. Hover to pause, swipe on
              mobile, or use the arrows to browse.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            View all products →
          </Link>
        </div>

        {loadError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {!loadError && products.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
            Products are loading into the catalogue.{' '}
            <Link href="/products" className="font-semibold text-orange-600 hover:underline">
              Browse the full catalogue
            </Link>
          </p>
        )}

        {!loadError && products.length > 0 && <ProductSlider products={products} />}
      </div>
    </section>
  );
}
