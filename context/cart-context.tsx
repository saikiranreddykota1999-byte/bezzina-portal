'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuantityListStorage } from '@/hooks/use-quantity-list-storage';
import type { CartItem } from '@/types/user';

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'bezzina-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { items, count, addItem, removeItem, updateQuantity, clear } =
    useQuantityListStorage<CartItem>(STORAGE_KEY, { removeOnZero: true });

  const value = useMemo(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      updateQuantity,
      clearCart: clear,
    }),
    [items, count, addItem, removeItem, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
