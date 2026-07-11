'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CheckoutPickupSelection, DeliveryAddress, FulfillmentMethod } from '@/types/pickup';

type CheckoutContextValue = {
  fulfillmentMethod: FulfillmentMethod;
  pickup: CheckoutPickupSelection | null;
  deliveryAddress: DeliveryAddress | null;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  setPickupSelection: (selection: CheckoutPickupSelection | null) => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  isPickupComplete: boolean;
  isDeliveryComplete: boolean;
  isFulfillmentComplete: boolean;
  clearCheckout: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);
const STORAGE_KEY = 'bezzina-checkout';

type StoredCheckout = {
  fulfillmentMethod: FulfillmentMethod;
  pickup: CheckoutPickupSelection | null;
  deliveryAddress: DeliveryAddress | null;
};

function readStoredCheckout(): StoredCheckout {
  if (typeof window === 'undefined') {
    return { fulfillmentMethod: 'delivery', pickup: null, deliveryAddress: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : { fulfillmentMethod: 'delivery', pickup: null, deliveryAddress: null };
  } catch {
    return { fulfillmentMethod: 'delivery', pickup: null, deliveryAddress: null };
  }
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [fulfillmentMethod, setFulfillmentMethodState] =
    useState<FulfillmentMethod>('delivery');
  const [pickup, setPickup] = useState<CheckoutPickupSelection | null>(null);
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredCheckout();
    setFulfillmentMethodState(stored.fulfillmentMethod);
    setPickup(stored.pickup);
    setDeliveryAddressState(stored.deliveryAddress);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fulfillmentMethod, pickup, deliveryAddress }),
    );
  }, [fulfillmentMethod, pickup, deliveryAddress, hydrated]);

  const setFulfillmentMethod = useCallback((method: FulfillmentMethod) => {
    setFulfillmentMethodState(method);
    if (method === 'delivery') {
      setPickup(null);
    } else {
      setDeliveryAddressState(null);
    }
  }, []);

  const setPickupSelection = useCallback((selection: CheckoutPickupSelection | null) => {
    setPickup(selection);
  }, []);

  const setDeliveryAddress = useCallback((address: DeliveryAddress | null) => {
    setDeliveryAddressState(address);
  }, []);

  const clearCheckout = useCallback(() => {
    setFulfillmentMethodState('delivery');
    setPickup(null);
    setDeliveryAddressState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isPickupComplete = useMemo(() => {
    if (fulfillmentMethod !== 'store_pickup') return true;
    return Boolean(pickup?.locationId && pickup.pickupDate && pickup.pickupTime);
  }, [fulfillmentMethod, pickup]);

  const isDeliveryComplete = useMemo(() => {
    if (fulfillmentMethod !== 'delivery') return true;
    return Boolean(
      deliveryAddress?.line1 &&
        deliveryAddress.city &&
        deliveryAddress.postalCode &&
        deliveryAddress.country,
    );
  }, [fulfillmentMethod, deliveryAddress]);

  const isFulfillmentComplete = isPickupComplete && isDeliveryComplete;

  const value = useMemo(
    () => ({
      fulfillmentMethod,
      pickup,
      deliveryAddress,
      setFulfillmentMethod,
      setPickupSelection,
      setDeliveryAddress,
      isPickupComplete,
      isDeliveryComplete,
      isFulfillmentComplete,
      clearCheckout,
    }),
    [
      fulfillmentMethod,
      pickup,
      deliveryAddress,
      setFulfillmentMethod,
      setPickupSelection,
      setDeliveryAddress,
      isPickupComplete,
      isDeliveryComplete,
      isFulfillmentComplete,
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
