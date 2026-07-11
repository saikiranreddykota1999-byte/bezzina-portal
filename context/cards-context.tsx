'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { detectCardBrand } from '@/lib/payment';
import type { PaymentCard } from '@/types/payment';

type CardsContextValue = {
  cards: PaymentCard[];
  addCard: (card: Omit<PaymentCard, 'id' | 'addedAt' | 'isDefault'> & { isDefault?: boolean }) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  defaultCard: PaymentCard | null;
};

const CardsContext = createContext<CardsContextValue | null>(null);
const STORAGE_KEY = 'bezzina-cards';

function readStoredCards(): PaymentCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function maskCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16);
}

export function formatCardNumber(value: string) {
  return maskCardNumber(value).replace(/(.{4})/g, '$1 ').trim();
}

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<PaymentCard[]>(readStoredCards);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const addCard = useCallback(
    (card: Omit<PaymentCard, 'id' | 'addedAt' | 'isDefault'> & { isDefault?: boolean }) => {
      setCards((prev) => {
        const isDefault = card.isDefault ?? prev.length === 0;
        const next = prev.map((c) => ({ ...c, isDefault: isDefault ? false : c.isDefault }));
        return [
          ...next,
          {
            ...card,
            id: crypto.randomUUID(),
            brand: card.brand || detectCardBrand(card.last4),
            addedAt: new Date().toISOString(),
            isDefault,
          },
        ];
      });
    },
    [],
  );

  const removeCard = useCallback((id: string) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length && !filtered.some((c) => c.isDefault)) {
        filtered[0].isDefault = true;
      }
      return [...filtered];
    });
  }, []);

  const setDefaultCard = useCallback((id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  }, []);

  const defaultCard = useMemo(() => cards.find((c) => c.isDefault) ?? cards[0] ?? null, [cards]);

  const value = useMemo(
    () => ({ cards, addCard, removeCard, setDefaultCard, defaultCard }),
    [cards, addCard, removeCard, setDefaultCard, defaultCard],
  );

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>;
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error('useCards must be used within CardsProvider');
  return ctx;
}

