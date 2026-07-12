'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
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
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEY, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
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
  }, [setItems]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, [setItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }, [setItems]);

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
