'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  getWishlistAction,
  removeWishlistItemAction,
  syncWishlistAction,
  toggleWishlistAction,
} from '@/actions/wishlist';
import { createClient } from '@/lib/supabase/client';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { WishlistItem } from '@/types/user';

type WishlistContextValue = {
  items: WishlistItem[];
  toggle: (item: Omit<WishlistItem, 'addedAt'>) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  synced: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'bezzina-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [localItems, setLocalItems] = useLocalStorage<WishlistItem[]>(STORAGE_KEY, []);
  const [serverItems, setServerItems] = useState<WishlistItem[] | null>(null);
  const [synced, setSynced] = useState(false);
  const [, startTransition] = useTransition();
  const syncingRef = useRef(false);

  const items = serverItems ?? localItems;

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function hydrate() {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setServerItems(null);
            setSynced(false);
          }
          return;
        }

        const guestSnapshot =
          typeof window !== 'undefined'
            ? (JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as WishlistItem[])
            : [];

        const result =
          Array.isArray(guestSnapshot) && guestSnapshot.length > 0
            ? await syncWishlistAction(
                guestSnapshot.map((entry) => ({
                  productId: entry.productId,
                  slug: entry.slug,
                  name: entry.name,
                  sku: entry.sku,
                  price: entry.price,
                  image_url: entry.image_url,
                })),
              )
            : await getWishlistAction();

        if (cancelled) return;

        if (result.success) {
          setServerItems(result.data ?? []);
          setLocalItems([]);
          setSynced(true);
        }
      } catch {
        if (!cancelled) setSynced(false);
      } finally {
        syncingRef.current = false;
      }
    }

    void hydrate();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        void hydrate();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setLocalItems]);

  const toggle = useCallback(
    (item: Omit<WishlistItem, 'addedAt'>) => {
      if (serverItems) {
        startTransition(async () => {
          const result = await toggleWishlistAction(item);
          if (result.success && result.data) {
            setServerItems(result.data.items);
          }
        });
        return;
      }

      setLocalItems((prev) => {
        const exists = prev.find((entry) => entry.productId === item.productId);
        if (exists) return prev.filter((entry) => entry.productId !== item.productId);
        return [...prev, { ...item, addedAt: new Date().toISOString() }];
      });
    },
    [serverItems, setLocalItems],
  );

  const remove = useCallback(
    (productId: string) => {
      if (serverItems) {
        startTransition(async () => {
          const result = await removeWishlistItemAction(productId);
          if (result.success) {
            setServerItems(result.data ?? []);
          }
        });
        return;
      }

      setLocalItems((prev) => prev.filter((entry) => entry.productId !== productId));
    },
    [serverItems, setLocalItems],
  );

  const has = useCallback(
    (productId: string) => items.some((entry) => entry.productId === productId),
    [items],
  );

  const value = useMemo(
    () => ({ items, toggle, remove, has, synced }),
    [items, toggle, remove, has, synced],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
