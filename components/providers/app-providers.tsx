'use client';

import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { CardsProvider } from '@/context/cards-context';
import { CheckoutProvider } from '@/context/checkout-context';
import { QuoteCartProvider } from '@/context/quote-cart-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <QuoteCartProvider>
        <WishlistProvider>
          <CardsProvider>
            <CheckoutProvider>{children}</CheckoutProvider>
          </CardsProvider>
        </WishlistProvider>
      </QuoteCartProvider>
    </CartProvider>
  );
}
