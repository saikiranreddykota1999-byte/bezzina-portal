'use client';

import { PRODUCT_FEATURE_FLAGS } from '@/types/product';
import { AdminToggle } from '@/components/admin/ui/admin-toggle';
import { adminCardClass } from '@/components/admin/admin-styles';

type FeatureFlags = Record<(typeof PRODUCT_FEATURE_FLAGS)[number]['key'], boolean>;

type Props = {
  flags: FeatureFlags;
  onChange: (flags: FeatureFlags) => void;
};

export function ProductFeatureToggles({ flags, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PRODUCT_FEATURE_FLAGS.map(({ key, label }) => (
        <div key={key} className={`${adminCardClass} !p-3`}>
          <AdminToggle
            id={`feature-${key}`}
            label={label}
            checked={flags[key]}
            onChange={(checked) => onChange({ ...flags, [key]: checked })}
          />
        </div>
      ))}
    </div>
  );
}
