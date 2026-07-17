'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

export type QuantityListItem = {
  productId: string;
  quantity: number;
  variantId?: string | null;
};

type Options = {
  /** When true (default), quantity <= 0 removes the line. When false, quantity < 1 is ignored. */
  removeOnZero?: boolean;
};

function lineKey(item: { productId: string; variantId?: string | null }): string {
  return item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
}

/**
 * Shared localStorage-backed quantity list used by cart and quote-cart contexts.
 */
export function useQuantityListStorage<T extends QuantityListItem>(
  storageKey: string,
  options: Options = {},
) {
  const removeOnZero = options.removeOnZero ?? true;
  const [items, setItems] = useLocalStorage<T[]>(storageKey, []);

  const addItem = useCallback(
    (item: Omit<T, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(item);
        const existing = prev.find((i) => lineKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { ...item, quantity } as T];
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      const key = lineKey({ productId, variantId });
      setItems((prev) => prev.filter((i) => lineKey(i) !== key));
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string | null) => {
      const key = lineKey({ productId, variantId });
      if (removeOnZero) {
        if (quantity <= 0) {
          setItems((prev) => prev.filter((i) => lineKey(i) !== key));
          return;
        }
      } else if (quantity < 1) {
        return;
      }

      setItems((prev) =>
        prev.map((i) => (lineKey(i) === key ? { ...i, quantity } : i)),
      );
    },
    [removeOnZero, setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const replaceItems = useCallback(
    (next: T[]) => {
      setItems(next);
    },
    [setItems],
  );

  const has = useCallback(
    (productId: string, variantId?: string | null) =>
      items.some((i) => lineKey(i) === lineKey({ productId, variantId })),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  return {
    items,
    setItems,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    replaceItems,
    has,
  };
}
