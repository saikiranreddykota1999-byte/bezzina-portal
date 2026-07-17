'use client';

import { Store, Truck } from 'lucide-react';
import type { FulfillmentMethod } from '@/types/pickup';

const OPTIONS: Array<{
  value: FulfillmentMethod;
  title: string;
  description: string;
  icon: typeof Truck;
}> = [
  {
    value: 'delivery',
    title: 'Delivery',
    description: 'Ship to your saved address across Malta.',
    icon: Truck,
  },
  {
    value: 'store_pickup',
    title: 'Store Pickup',
    description: 'Collect from a Bezzina branch at your chosen time.',
    icon: Store,
  },
];

type Props = {
  value: FulfillmentMethod;
  onChange: (method: FulfillmentMethod) => void;
};

export function FulfillmentSelector({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">Fulfillment method</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="fulfillment-method"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <div
                className={`rounded-2xl border p-4 transition peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2 ${
                  selected
                    ? 'border-orange-400 bg-orange-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2 ${selected ? 'bg-orange-700 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{option.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
