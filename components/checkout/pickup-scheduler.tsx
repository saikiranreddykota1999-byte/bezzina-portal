'use client';

import { useEffect, useState } from 'react';
import {
  getActivePickupLocations,
  getPickupAvailableDates,
  getPickupAvailableSlots,
} from '@/actions/pickup/customer';
import type {
  AvailablePickupSlot,
  CheckoutPickupSelection,
  PickupLocation,
} from '@/types/pickup';
import { PickupInstructions } from '@/components/checkout/pickup-instructions';

const inputClassName =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500';

type Props = {
  value: CheckoutPickupSelection | null;
  onChange: (value: CheckoutPickupSelection | null) => void;
};

export function PickupScheduler({ value, onChange }: Props) {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<AvailablePickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedLocation = locations.find((location) => location.id === value?.locationId) ?? null;
  const locationId = value?.locationId ?? '';
  const pickupDate = value?.pickupDate ?? '';

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      setLoading(true);
      const result = await getActivePickupLocations();
      if (cancelled) return;

      if (!result.success) {
        setError(result.error ?? 'Failed to load pickup branches');
        setLoading(false);
        return;
      }

      setLocations(result.data ?? []);
      setLoading(false);
    }

    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!locationId) return;

    let cancelled = false;

    async function loadDates() {
      const result = await getPickupAvailableDates(locationId);
      if (!cancelled && result.success) {
        setDates(result.data ?? []);
      }
    }

    void loadDates();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    if (!locationId || !pickupDate) return;

    let cancelled = false;

    async function loadSlots() {
      const result = await getPickupAvailableSlots(locationId, pickupDate);
      if (!cancelled && result.success) {
        setSlots(result.data ?? []);
      }
    }

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [locationId, pickupDate]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading pickup branches…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="font-semibold text-slate-900">Store pickup details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose your branch, date, and time slot for collection.
        </p>
      </div>

      <div>
        <label htmlFor="pickup-location" className="mb-1.5 block text-sm font-medium text-slate-700">
          Pickup branch
        </label>
        <select
          id="pickup-location"
          value={locationId}
          onChange={(event) =>
            onChange(
              event.target.value
                ? {
                    locationId: event.target.value,
                    pickupDate: '',
                    pickupTime: '',
                  }
                : null,
            )
          }
          className={inputClassName}
        >
          <option value="">Select a branch</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && <PickupInstructions location={selectedLocation} />}

      {locationId && (
        <div>
          <label htmlFor="pickup-date" className="mb-1.5 block text-sm font-medium text-slate-700">
            Pickup date
          </label>
          <select
            id="pickup-date"
            value={pickupDate}
            onChange={(event) =>
              onChange({
                locationId,
                pickupDate: event.target.value,
                pickupTime: '',
              })
            }
            className={inputClassName}
          >
            <option value="">Select a date</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {new Intl.DateTimeFormat('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                }).format(new Date(`${date}T12:00:00`))}
              </option>
            ))}
          </select>
        </div>
      )}

      {pickupDate && (
        <div>
          <label htmlFor="pickup-time" className="mb-1.5 block text-sm font-medium text-slate-700">
            Pickup time
          </label>
          <select
            id="pickup-time"
            value={value?.pickupTime ?? ''}
            onChange={(event) =>
              onChange({
                locationId,
                pickupDate,
                pickupTime: event.target.value,
              })
            }
            className={inputClassName}
          >
            <option value="">Select a time slot</option>
            {slots.map((slot) => (
              <option key={slot.slotTime} value={slot.slotTime}>
                {slot.label} ({slot.remainingCapacity} spaces left)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
