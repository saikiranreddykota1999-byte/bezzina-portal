'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

export type CompareItem = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  image_url: string | null;
};

const STORAGE_KEY = 'bezzina-product-compare';
const MAX_ITEMS = 4;

export function useProductCompare() {
  const [items, setItems] = useLocalStorage<CompareItem[]>(STORAGE_KEY, []);

  const add = useCallback(
    (item: CompareItem) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev;
        if (prev.length >= MAX_ITEMS) return prev;
        return [...prev, item];
      });
    },
    [setItems],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [setItems],
  );

  const has = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const isFull = items.length >= MAX_ITEMS;

  return useMemo(
    () => ({ items, add, remove, has, clear, isFull, maxItems: MAX_ITEMS }),
    [items, add, remove, has, clear, isFull],
  );
}
