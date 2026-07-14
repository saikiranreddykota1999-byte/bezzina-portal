import { filterProducts } from '@/lib/catalogue-filters';
import type { Product } from '@/types/product';

export type ProductSearchHit = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  image_url: string | null;
  price: number | null;
  unit: string;
  availability?: Product['availability'];
  in_stock: boolean;
};

export function toProductSearchHit(product: Product): ProductSearchHit {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    image_url: product.image_url,
    price: product.price,
    unit: product.unit,
    availability: product.availability,
    in_stock: product.in_stock,
  };
}

export function quickSearchProducts(
  products: Product[],
  query: string,
  limit = 6,
): ProductSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { products: matches } = filterProducts(products, {
    query: trimmed,
    page: 1,
    pageSize: limit,
    sort: 'name-asc',
  });

  return matches.map(toProductSearchHit);
}
