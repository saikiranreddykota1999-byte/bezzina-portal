'use client';

import { useEffect, useRef, useState } from 'react';
import type { DeliveryAddress } from '@/types/pickup';

type Props = {
  value: DeliveryAddress | null;
  onChange: (address: DeliveryAddress | null) => void;
};

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
): Partial<DeliveryAddress> {
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? '';

  const streetNumber = get('street_number');
  const route = get('route');
  const line1 = [streetNumber, route].filter(Boolean).join(' ') || route;

  return {
    line1,
    city: get('locality') || get('postal_town') || get('administrative_area_level_1'),
    postalCode: get('postal_code'),
    country: get('country'),
  };
}

export function DeliveryAddressForm({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState(!GOOGLE_KEY);
  const [form, setForm] = useState({
    line1: value?.line1 ?? '',
    line2: value?.line2 ?? '',
    city: value?.city ?? '',
    postalCode: value?.postalCode ?? '',
    country: value?.country ?? 'Malta',
  });

  useEffect(() => {
    if (!GOOGLE_KEY || manual || !inputRef.current) return;

    const scriptId = 'google-maps-places';
    const init = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['mt'] },
        fields: ['formatted_address', 'geometry', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location || !place.address_components) return;

        const parsed = parseAddressComponents(place.address_components);
        const address: DeliveryAddress = {
          formattedAddress: place.formatted_address ?? '',
          line1: parsed.line1 || place.formatted_address?.split(',')[0] || '',
          line2: '',
          city: parsed.city || 'Malta',
          postalCode: parsed.postalCode || '',
          country: parsed.country || 'Malta',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onChange(address);
        setForm({
          line1: address.line1,
          line2: address.line2 ?? '',
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        });
      });
    };

    if (document.getElementById(scriptId)) {
      init();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [manual, onChange]);

  function submitManual() {
    if (!form.line1 || !form.city || !form.postalCode) return;
    const formatted = [form.line1, form.city, form.postalCode, form.country]
      .filter(Boolean)
      .join(', ');
    onChange({
      formattedAddress: formatted,
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      lat: 35.9375,
      lng: 14.3754,
    });
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

  return (
    <div className="space-y-4">
      {!manual && GOOGLE_KEY ? (
        <>
          <div>
            <label htmlFor="delivery-search" className="mb-1.5 block text-sm font-medium text-slate-700">
              Search delivery address
            </label>
            <input
              id="delivery-search"
              ref={inputRef}
              type="text"
              placeholder="Start typing your address..."
              defaultValue={value?.formattedAddress}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={() => setManual(true)}
            className="text-sm text-orange-800 hover:underline"
          >
            Enter address manually
          </button>
        </>
      ) : (
        <div className="space-y-3">
          {!GOOGLE_KEY && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for Google address search. Using manual entry.
            </p>
          )}
          <input
            placeholder="Address line 1"
            aria-label="Address line 1"
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            className={inputClass}
          />
          <input
            placeholder="Address line 2 (optional)"
            aria-label="Address line 2 (optional)"
            value={form.line2}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
            className={inputClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="City"
              aria-label="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className={inputClass}
            />
            <input
              placeholder="Postal code"
              aria-label="Postal code"
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Country"
            aria-label="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className={inputClass}
          />
          <button
            type="button"
            onClick={submitManual}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Confirm address
          </button>
          {GOOGLE_KEY && (
            <button type="button" onClick={() => setManual(false)} className="ml-3 text-sm text-orange-800 hover:underline">
              Use Google search
            </button>
          )}
        </div>
      )}

      {value && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-900">Delivery to:</p>
          <p className="mt-1 text-sm text-green-800">{value.formattedAddress}</p>
          {GOOGLE_KEY && (
            <iframe
              title="Delivery location map"
              className="mt-3 h-40 w-full rounded-lg border border-slate-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${value.lat},${value.lng}&zoom=15`}
            />
          )}
        </div>
      )}
    </div>
  );
}
