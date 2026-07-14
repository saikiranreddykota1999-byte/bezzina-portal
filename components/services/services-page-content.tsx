'use client';

import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { defaultTransition, staggerContainer } from '@/lib/motion';
import {
  SERVICE_ITEMS,
  SERVICES_PAGE_CONTENT,
} from '@/lib/services/page-content';
import { ServiceCard } from '@/components/services/service-card';
import { HowItWorksTimeline } from '@/components/services/how-it-works-timeline';

export function ServicesPageContent() {
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();

  return (
    <main>
      <section className="relative overflow-hidden bg-white py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,61,145,0.08),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(216,161,6,0.08),transparent_40%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
              {SERVICES_PAGE_CONTENT.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#071B35] sm:text-5xl">
              {SERVICES_PAGE_CONTENT.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              {SERVICES_PAGE_CONTENT.description}
            </p>
          </motion.div>
        </div>
      </section>

      <section
        className="bg-[#F8FAFC] py-14 sm:py-20"
        aria-labelledby="services-grid-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="services-grid-title" className="sr-only">
            Our services
          </h2>
          <motion.div
            ref={gridRef}
            className="grid gap-6 sm:grid-cols-2 sm:gap-8"
            initial="hidden"
            animate={gridInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {SERVICE_ITEMS.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      <HowItWorksTimeline />

      <section className="bg-[#F8FAFC] py-14 sm:py-16">
        <motion.div
          ref={ctaRef}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={defaultTransition}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6"
        >
          <h2 className="text-2xl font-bold text-[#071B35] sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Send your requirements and our team will respond with a competitive quotation for
            marine and industrial supply.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-full bg-[#0B3D91] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(11,61,145,0.25)] transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              Ask for quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-[#071B35] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
