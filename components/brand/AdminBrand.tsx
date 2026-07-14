'use client';

import { company } from '@/config/company';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';

type Props = {
  collapsed?: boolean;
};

export function AdminBrand({ collapsed = false }: Props) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-1">
        <AnimatedLogo variant="admin-sidebar" priority />
      </div>
    );
  }

  return (
    <div className="admin-brand-block">
      <AnimatedLogo variant="admin-sidebar" priority />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight text-white">{company.shortName}</p>
        <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#D8A106]">
          {company.invoice.tagline}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-white/55">Admin Portal</p>
      </div>
    </div>
  );
}
