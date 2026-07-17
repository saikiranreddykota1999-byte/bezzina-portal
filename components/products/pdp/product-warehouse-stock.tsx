'use client';

import type { WarehouseAvailabilityRow } from '@/types/product';

type Props = {
  warehouseAvailability: WarehouseAvailabilityRow[];
};

function stockLabel(band: WarehouseAvailabilityRow['stockBand']): string {
  return band === 'limited' ? 'Limited' : 'In stock';
}

export function ProductWarehouseStock({ warehouseAvailability }: Props) {
  if (warehouseAvailability.length === 0) return null;

  const count = warehouseAvailability.length;

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-slate-700">
        Available at {count} location{count === 1 ? '' : 's'}
      </p>
      <ul className="mt-2 space-y-1">
        {warehouseAvailability.map((row) => (
          <li
            key={row.warehouseId}
            className="flex items-center justify-between text-sm text-slate-600"
          >
            <span>{row.warehouseName}</span>
            <span
              className={
                row.stockBand === 'limited'
                  ? 'font-medium text-amber-800'
                  : 'font-medium text-emerald-800'
              }
            >
              {stockLabel(row.stockBand)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
