'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { WHY_VISIT_FEATURES } from '@/lib/contact/page-content';
import { defaultTransition, fadeInUp, staggerContainer } from '@/lib/motion';

export function WhyVisitStore() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className="bg-white py-14 sm:py-20"
      aria-labelledby="why-visit-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={defaultTransition}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
            Why Visit
          </p>
          <h2 id="why-visit-title" className="mt-4 text-3xl font-bold text-[#071B35] sm:text-4xl">
            Why Visit Our Store?
          </h2>
          <p className="mt-3 text-slate-600">
            Collect in person, speak with specialists, and source what you need from our Marsa warehouse.
          </p>
        </motion.div>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {WHY_VISIT_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.id}
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: index * 0.05 }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
                className="rounded-[20px] border border-slate-200/80 bg-[#F8FAFC] p-6 shadow-sm transition-shadow hover:shadow-[0_12px_32px_rgba(11,61,145,0.1)]"
              >
                <motion.span
                  whileHover={reduceMotion ? undefined : { rotate: 8 }}
                  transition={defaultTransition}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <h3 className="mt-4 text-lg font-bold text-[#071B35]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
