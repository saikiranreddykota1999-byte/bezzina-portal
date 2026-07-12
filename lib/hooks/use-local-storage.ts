'use client';

import { useCallback, useSyncExternalStore } from 'react';

type CacheEntry = {
  raw: string | null;
  value: unknown;
};

const snapshotCache = new Map<string, CacheEntry>();
const serverSnapshotCache = new Map<string, unknown>();

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('local-storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('local-storage', handler);
  };
}

function getSnapshot<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    const cached = snapshotCache.get(key);
    if (cached?.raw === raw) {
      return cached.value as T;
    }

    const value = raw === null ? fallback : (JSON.parse(raw) as T);
    snapshotCache.set(key, { raw, value });
    return value;
  } catch {
    const cached = snapshotCache.get(key);
    if (cached?.raw === '__error__') {
      return cached.value as T;
    }
    snapshotCache.set(key, { raw: '__error__', value: fallback });
    return fallback;
  }
}

function getServerSnapshot<T>(key: string, fallback: T): T {
  if (!serverSnapshotCache.has(key)) {
    serverSnapshotCache.set(key, fallback);
  }
  return serverSnapshotCache.get(key) as T;
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key, fallback),
    () => getServerSnapshot(key, fallback),
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function'
          ? (next as (prev: T) => T)(getSnapshot(key, fallback))
          : next;
      const serialized = JSON.stringify(resolved);
      localStorage.setItem(key, serialized);
      snapshotCache.set(key, { raw: serialized, value: resolved });
      window.dispatchEvent(new Event('local-storage'));
    },
    [key, fallback],
  );

  return [value, setValue] as const;
}
