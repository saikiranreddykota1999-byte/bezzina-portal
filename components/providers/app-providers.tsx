'use client';

import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { CardsProvider } from '@/context/cards-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <CardsProvider>{children}</CardsProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
