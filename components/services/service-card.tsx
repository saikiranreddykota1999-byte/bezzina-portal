'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultTransition, fadeInUp } from '@/lib/motion';
import type { ServiceDefinition } from '@/lib/services/page-content';
import { ServiceIllustration } from '@/components/services/service-illustration';

type Props = {
  service: ServiceDefinition;
  index: number;
};

export function ServiceCard({ service, index }: Props) {
  const reduceMotion = useReducedMotion();
  const IconRow = service.icons;

  return (
    <motion.article
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay: index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(7,27,53,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(11,61,145,0.12)]"
    >
      <ServiceIllustration illustration={service.illustration} className="h-44 shrink-0" />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          {IconRow.map((Icon, iconIndex) => (
            <motion.span
              key={`${service.id}-icon-${iconIndex}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]"
              whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 4 }}
              transition={defaultTransition}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          ))}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-[#071B35] sm:text-2xl">
          {service.title}
        </h2>
        <p className="sr-only">{service.summary}</p>
        <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 sm:text-base">
          {service.description}
        </p>

        <p className="mt-4 rounded-xl border border-[#D8A106]/30 bg-[#FBF4E0] px-4 py-3 text-sm font-medium text-[#071B35]">
          {service.highlight}
        </p>

        <Link
          href={service.ctaHref}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0B3D91] transition-colors group-hover:text-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          {service.ctaLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.article>
  );
}
