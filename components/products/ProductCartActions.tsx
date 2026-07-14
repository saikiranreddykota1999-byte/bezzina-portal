'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { isQuoteOnlyProduct, resolveQuoteLinePrice } from '@/lib/pricing';

type Props = {
  product: Pick<
    Product,
    'id' | 'slug' | 'name' | 'sku' | 'price' | 'unit' | 'image_url' | 'in_stock'
  >;
  layout?: 'card' | 'detail';
};

export function ProductCartActions({ product, layout = 'card' }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const quoteOnly = isQuoteOnlyProduct(product.price);
  const unitPrice = resolveQuoteLinePrice(product.price);

  const btnBase =
    layout === 'detail'
      ? 'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto'
      : 'inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition';

  if (quoteOnly) {
    return (
      <Link
        href="/quote"
        className={`${btnBase} bg-[#0B3D91] text-white hover:bg-[#09407a]`}
      >
        <ClipboardList className="h-4 w-4" />
        Request Quote
      </Link>
    );
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.in_stock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      price: unitPrice,
      unit: product.unit,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      disabled={!product.in_stock}
      onClick={handleAddToCart}
      className={`${btnBase} ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? 'Added to cart' : 'Add to cart'}
    </button>
  );
}
