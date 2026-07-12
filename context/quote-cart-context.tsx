'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { QuoteCartItem } from '@/types/quote';

const STORAGE_KEY = 'bezzina-quote-cart';

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  count: number;
  addItem: (item: Omit<QuoteCartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  replaceItems: (items: QuoteCartItem[]) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<QuoteCartItem[]>(STORAGE_KEY, []);

  const addItem = useCallback(
    (item: Omit<QuoteCartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    [setItems],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, [setItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }, [setItems]);

  const clear = useCallback(() => setItems([]), [setItems]);

  const replaceItems = useCallback((next: QuoteCartItem[]) => {
    setItems(next);
  }, [setItems]);

  const has = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, count, addItem, removeItem, updateQuantity, replaceItems, clear, has }),
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
