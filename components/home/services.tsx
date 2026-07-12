'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SERVICE_ITEMS } from '@/lib/services/page-content';
import { ServiceCard } from '@/components/services/service-card';
import type { ServicesContent } from '@/types/cms';

type Props = { content?: Partial<ServicesContent> };

export function Services({ content }: Props) {
  const services = SERVICE_ITEMS.slice(0, 4);

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
            {content?.eyebrow ?? 'Services'}
          </p>
          <h2
            id="services-title"
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            {content?.title ?? 'Supply services tailored to marine and industrial customers'}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B3D91] transition hover:text-[#09407a]"
          >
            View all services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
