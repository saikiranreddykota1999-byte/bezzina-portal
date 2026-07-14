'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClipboardList, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useQuoteCart } from '@/context/quote-cart-context';
import { buildCartLineItem } from '@/lib/products/build-cart-line-item';
import type { Product, ProductVariant } from '@/types/product';

export type PurchaseProduct = Pick<
  Product,
  'id' | 'slug' | 'name' | 'sku' | 'price' | 'unit' | 'image_url' | 'in_stock'
>;

type Props = {
  product: PurchaseProduct;
  selectedVariant?: ProductVariant | null;
  layout?: 'card' | 'detail';
  disabled?: boolean;
};

export function ProductPurchaseActions({
  product,
  selectedVariant = null,
  layout = 'detail',
  disabled = false,
}: Props) {
  const router = useRouter();
  const { addItem: addToCart } = useCart();
  const { addItem: addToQuote } = useQuoteCart();
  const [cartAdded, setCartAdded] = useState(false);

  const isDisabled = disabled || !product.in_stock;
  const lineItem = buildCartLineItem(product, selectedVariant);

  const btnBase =
    layout === 'detail'
      ? 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
      : 'inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

  function handleAddToCart() {
    if (isDisabled) return;
    addToCart(lineItem);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  }

  function handleBuyNow() {
    if (isDisabled) return;
    addToCart(lineItem);
    router.push('/account/checkout');
  }

  function handleAskForQuote() {
    addToQuote(lineItem);
    router.push('/quote');
  }

  const containerClass =
    layout === 'detail'
      ? 'flex flex-col gap-3 sm:flex-row sm:flex-wrap'
      : 'flex flex-col gap-2';

  return (
    <div className={containerClass}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleAddToCart}
        className={`${btnBase} ${
          cartAdded
            ? 'bg-emerald-600 text-white'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {cartAdded ? 'Added to cart' : 'Add to cart'}
      </button>

      <button
        type="button"
        disabled={isDisabled}
        onClick={handleBuyNow}
        className={`${btnBase} bg-[#0B3D91] text-white hover:bg-[#09407a]`}
      >
        <Zap className="h-4 w-4" aria-hidden="true" />
        Buy now
      </button>

      <button
        type="button"
        onClick={handleAskForQuote}
        className={`${btnBase} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}
      >
        <ClipboardList className="h-4 w-4" aria-hidden="true" />
        Ask for quote
      </button>
    </div>
  );
}
