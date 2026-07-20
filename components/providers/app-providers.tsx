'use client';

import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { CheckoutProvider } from '@/context/checkout-context';
import { QuoteCartProvider } from '@/context/quote-cart-context';
import { CompareTray } from '@/components/products/compare-tray';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <QuoteCartProvider>
        <WishlistProvider>
          <CheckoutProvider>
            {children}
            <CompareTray />
          </CheckoutProvider>
        </WishlistProvider>
      </QuoteCartProvider>
    </CartProvider>
  );
}
