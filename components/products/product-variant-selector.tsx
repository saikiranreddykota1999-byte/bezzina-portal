'use client';

import { ProductVariant } from '@/types/product';
import { formatAvailabilityLabel } from '@/lib/pricing';

type Props = {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variant: ProductVariant) => void;
};

export function ProductVariantSelector({ variants, selectedId, onSelect }: Props) {
  if (variants.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-slate-900">Select Size / Variant</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const active = selectedId === variant.id;
          const label = formatAvailabilityLabel(variant.availability, variant.in_stock);
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={[
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                active
                  ? 'border-[#0B3D91] bg-[#0B3D91] text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-[#0B3D91]',
              ].join(' ')}
              aria-pressed={active}
            >
              <span>{variant.name}</span>
              <span className="ml-2 text-xs opacity-80">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
