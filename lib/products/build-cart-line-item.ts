import { resolveQuoteLinePrice } from '@/lib/pricing';
import type { Product, ProductVariant } from '@/types/product';
import type { CartItem } from '@/types/user';

export type LineItemProduct = Pick<
  Product,
  'id' | 'slug' | 'name' | 'sku' | 'price' | 'unit' | 'image_url'
>;

export function buildCartLineItem(
  product: LineItemProduct,
  selectedVariant?: ProductVariant | null,
): Omit<CartItem, 'quantity'> {
  return {
    productId: product.id,
    slug: product.slug,
    name: `${product.name}${selectedVariant ? ` — ${selectedVariant.name}` : ''}`,
    sku: selectedVariant?.sku ?? product.sku,
    price: resolveQuoteLinePrice(selectedVariant?.price ?? product.price),
    unit: selectedVariant?.unit ?? product.unit,
    image_url: selectedVariant?.image_url ?? product.image_url,
  };
}
