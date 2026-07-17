'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuantityListStorage } from '@/hooks/use-quantity-list-storage';
import type { QuoteCartItem } from '@/types/quote';

const STORAGE_KEY = 'bezzina-quote-cart';

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  count: number;
  addItem: (item: Omit<QuoteCartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string | null,
  ) => void;
  replaceItems: (items: QuoteCartItem[]) => void;
  clear: () => void;
  has: (productId: string, variantId?: string | null) => boolean;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const {
    items,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    replaceItems,
    has,
  } = useQuantityListStorage<QuoteCartItem>(STORAGE_KEY, { removeOnZero: false });

  const value = useMemo(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      updateQuantity,
      replaceItems,
      clear,
      has,
    }),
    [items, count, addItem, removeItem, updateQuantity, replaceItems, clear, has],
  );

  return (
    <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error('useQuoteCart must be used within QuoteCartProvider');
  return ctx;
}
