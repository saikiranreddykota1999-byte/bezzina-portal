'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
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

const DEFAULT_CHECKOUT: StoredCheckout = {
  fulfillmentMethod: 'delivery',
  pickup: null,
  deliveryAddress: null,
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useLocalStorage<StoredCheckout>(STORAGE_KEY, DEFAULT_CHECKOUT);

  const setFulfillmentMethod = useCallback((method: FulfillmentMethod) => {
    setStored((prev) => ({
      ...prev,
      fulfillmentMethod: method,
      pickup: method === 'delivery' ? null : prev.pickup,
      deliveryAddress: method === 'store_pickup' ? null : prev.deliveryAddress,
    }));
  }, [setStored]);

  const setPickupSelection = useCallback((selection: CheckoutPickupSelection | null) => {
    setStored((prev) => ({ ...prev, pickup: selection }));
  }, [setStored]);

  const setDeliveryAddress = useCallback((address: DeliveryAddress | null) => {
    setStored((prev) => ({ ...prev, deliveryAddress: address }));
  }, [setStored]);

  const clearCheckout = useCallback(() => {
    setStored(DEFAULT_CHECKOUT);
  }, [setStored]);

  const isPickupComplete = Boolean(
    stored.pickup?.locationId && stored.pickup?.pickupDate && stored.pickup?.pickupTime,
  );
  const isDeliveryComplete = Boolean(
    stored.deliveryAddress?.line1 &&
    stored.deliveryAddress?.city &&
    stored.deliveryAddress?.postalCode,
  );
  const isFulfillmentComplete =
    stored.fulfillmentMethod === 'store_pickup' ? isPickupComplete : isDeliveryComplete;

  const value = useMemo(
    () => ({
      fulfillmentMethod: stored.fulfillmentMethod,
      pickup: stored.pickup,
      deliveryAddress: stored.deliveryAddress,
      setFulfillmentMethod,
      setPickupSelection,
      setDeliveryAddress,
      isPickupComplete,
      isDeliveryComplete,
      isFulfillmentComplete,
      clearCheckout,
    }),
    [
      stored,
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
