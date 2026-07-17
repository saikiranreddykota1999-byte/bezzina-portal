import { MapPin } from 'lucide-react';
import type { PickupLocation } from '@/types/pickup';
import { formatPickupAddress } from '@/lib/checkout';

type Props = {
  location: PickupLocation;
  compact?: boolean;
};

export function PickupInstructions({ location, compact = false }: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-800" />
        <div>
          <p className="font-medium text-slate-900">{location.name}</p>
          <p className="mt-1 text-sm text-slate-600">{formatPickupAddress(location)}</p>
          {location.phone && (
            <p className="mt-2 text-sm text-slate-600">Tel: {location.phone}</p>
          )}
          {location.instructions && (
            <p className="mt-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Pickup instructions: </span>
              {location.instructions}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
