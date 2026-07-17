'use client';

import {
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Truck,
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { defaultTransition, fadeInUp } from '@/lib/motion';
import { HOW_IT_WORKS_STEPS } from '@/lib/services/page-content';

const stepIcons = {
  message: MessageCircle,
  clipboard: ClipboardList,
  check: CheckCircle2,
  truck: Truck,
} as const;

export function HowItWorksTimeline() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className="bg-white py-16 sm:py-20"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={defaultTransition}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
            Process
          </p>
          <h2
            id="how-it-works-title"
            className="mt-3 text-3xl font-bold tracking-tight text-[#071B35] sm:text-4xl"
          >
            How It Works
          </h2>
        </motion.div>

        <div className="relative mt-14">
          <div
            className="absolute left-0 right-0 top-1/2 hidden h-0.5 -translate-y-1/2 bg-linear-to-r from-[#0B3D91]/10 via-[#D8A106]/40 to-[#0B3D91]/10 lg:block"
            aria-hidden="true"
          />
          <motion.ol
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.1 },
              },
            }}
          >
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = stepIcons[step.icon];
              return (
                <motion.li
                  key={step.id}
                  variants={fadeInUp}
                  transition={defaultTransition}
                  className="relative flex flex-col items-center text-center"
                >
                  <motion.div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#0B3D91]/15 bg-[#E8EFF9] text-[#0B3D91] shadow-sm"
                    whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: -3 }}
                    transition={defaultTransition}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#D8A106] text-xs font-bold text-[#071B35]">
                      {index + 1}
                    </span>
                  </motion.div>
                  <h3 className="mt-4 text-base font-semibold text-[#071B35] sm:text-lg">
                    {step.title}
                  </h3>
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <span
                      className="mt-6 text-2xl text-[#7A5C00] sm:col-span-2 lg:hidden"
                      aria-hidden="true"
                    >
                      ↓
                    </span>
                  )}
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <span
                      className="pointer-events-none absolute -right-3 top-8 hidden text-2xl text-[#7A5C00] lg:block xl:-right-5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>

          <motion.div
            className="mx-auto mt-6 hidden h-1 max-w-4xl overflow-hidden rounded-full bg-[#E8EFF9] lg:block"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ transformOrigin: 'left center' }}
            aria-hidden="true"
          >
            <div className="h-full w-full bg-linear-to-r from-[#0B3D91] via-[#D8A106] to-[#0B3D91]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
