'use client';

import ProductCard from '@/components/products/ProductCard';
import { useQuoteCart } from '@/context/quote-cart-context';
import { buildQuoteLineItem } from '@/lib/products/build-cart-line-item';
import type { Product } from '@/types/product';

type Props = {
  products: Product[];
  title?: string;
  description?: string;
  showAddAllToQuote?: boolean;
};

export function RelatedProducts({
  products,
  title = 'Related products',
  description = 'More items from the same category you may need.',
  showAddAllToQuote = false,
}: Props) {
  const { addItem } = useQuoteCart();

  if (products.length === 0) return null;

  function handleAddAllToQuote() {
    for (const product of products) {
      addItem(buildQuoteLineItem(product));
    }
  }

  return (
    <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="related-products-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="related-products-title" className="text-2xl font-bold text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {showAddAllToQuote ? (
          <button
            type="button"
            onClick={handleAddAllToQuote}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Add all to quote
          </button>
        ) : null}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
