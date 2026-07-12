import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types/product';

type Props = {
  products: Product[];
  title?: string;
};

export function RelatedProducts({
  products,
  title = 'Related products',
}: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="related-products-title">
      <h2 id="related-products-title" className="text-2xl font-bold text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        More items from the same category you may need.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
