'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CheckoutPickupSelection, FulfillmentMethod } from '@/types/pickup';

type CheckoutContextValue = {
  fulfillmentMethod: FulfillmentMethod;
  pickup: CheckoutPickupSelection | null;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  setPickupSelection: (selection: CheckoutPickupSelection | null) => void;
  isPickupComplete: boolean;
  clearCheckout: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);
const STORAGE_KEY = 'bezzina-checkout';

type StoredCheckout = {
  fulfillmentMethod: FulfillmentMethod;
  pickup: CheckoutPickupSelection | null;
};

function readStoredCheckout(): StoredCheckout {
  if (typeof window === 'undefined') {
    return { fulfillmentMethod: 'delivery', pickup: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { fulfillmentMethod: 'delivery', pickup: null };
  } catch {
    return { fulfillmentMethod: 'delivery', pickup: null };
  }
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [fulfillmentMethod, setFulfillmentMethodState] = useState<FulfillmentMethod>(
    () => readStoredCheckout().fulfillmentMethod,
  );
  const [pickup, setPickup] = useState<CheckoutPickupSelection | null>(
    () => readStoredCheckout().pickup,
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fulfillmentMethod, pickup }),
    );
  }, [fulfillmentMethod, pickup]);

  const setFulfillmentMethod = useCallback((method: FulfillmentMethod) => {
    setFulfillmentMethodState(method);
    if (method === 'delivery') {
      setPickup(null);
    }
  }, []);

  const setPickupSelection = useCallback((selection: CheckoutPickupSelection | null) => {
    setPickup(selection);
  }, []);

  const clearCheckout = useCallback(() => {
    setFulfillmentMethodState('delivery');
    setPickup(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isPickupComplete = useMemo(() => {
    if (fulfillmentMethod !== 'store_pickup') return true;
    return Boolean(pickup?.locationId && pickup.pickupDate && pickup.pickupTime);
  }, [fulfillmentMethod, pickup]);

  const value = useMemo(
    () => ({
      fulfillmentMethod,
      pickup,
      setFulfillmentMethod,
      setPickupSelection,
      isPickupComplete,
      clearCheckout,
    }),
    [
      fulfillmentMethod,
      pickup,
      setFulfillmentMethod,
      setPickupSelection,
      isPickupComplete,
      clearCheckout,
    ],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
