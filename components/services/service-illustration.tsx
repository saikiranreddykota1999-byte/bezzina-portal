'use client';

import dynamic from 'next/dynamic';
import type { ServiceDefinition } from '@/lib/services/page-content';

function IllustrationFallback() {
  return (
    <div
      className="h-44 w-full animate-pulse rounded-2xl bg-[#F8FAFC]"
      aria-hidden="true"
    />
  );
}

const illustrationMap = {
  quotations: dynamic(
    () => import('./service-illustrations').then((mod) => mod.QuotationsIllustration),
    { loading: () => <IllustrationFallback /> },
  ),
  sourcing: dynamic(
    () => import('./service-illustrations').then((mod) => mod.SourcingIllustration),
    { loading: () => <IllustrationFallback /> },
  ),
  technical: dynamic(
    () => import('./service-illustrations').then((mod) => mod.TechnicalIllustration),
    { loading: () => <IllustrationFallback /> },
  ),
  delivery: dynamic(
    () => import('./service-illustrations').then((mod) => mod.DeliveryIllustration),
    { loading: () => <IllustrationFallback /> },
  ),
};

type Props = {
  illustration: ServiceDefinition['illustration'];
  className?: string;
};

export function ServiceIllustration({ illustration, className = '' }: Props) {
  const Component = illustrationMap[illustration];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F8FAFC] ${className}`}>
      <Component />
    </div>
  );
}
