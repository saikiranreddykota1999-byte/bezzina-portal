'use client';

import { PRODUCT_FEATURE_FLAGS } from '@/types/product';

type FeatureFlags = Record<(typeof PRODUCT_FEATURE_FLAGS)[number]['key'], boolean>;

type Props = {
  flags: FeatureFlags;
  onChange: (flags: FeatureFlags) => void;
};

export function ProductFeatureToggles({ flags, onChange }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Product Features</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_FEATURE_FLAGS.map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
            <span className="text-slate-700">{label}</span>
            <input
              type="checkbox"
              checked={flags[key]}
              onChange={(e) => onChange({ ...flags, [key]: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-orange-500"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
