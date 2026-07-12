'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { defaultTransition, fadeInUp, staggerContainer } from '@/lib/motion';

function AnimatedStatValue({
  value,
  suffix,
  text,
  active,
}: {
  value: number | null;
  suffix?: string;
  text?: string;
  active: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || value === null || reduceMotion) return;

    let frame = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value, reduceMotion]);

  if (text) return <>{text}</>;
  if (value === null) return null;
  if (reduceMotion) return <>{value}{suffix}</>;
  return <>{count}{suffix}</>;
}

const TRUST_ITEMS = [
  { id: 'years', label: 'Years Experience', value: 55 as number | null, suffix: '+', text: undefined },
  { id: 'family', label: 'Family Business', value: null, suffix: undefined, text: 'Since 1969' },
  { id: 'location', label: 'Located in Marsa', value: null, suffix: undefined, text: 'Il-Marsa, Malta' },
  { id: 'trusted', label: 'Trusted Across Malta', value: null, suffix: undefined, text: 'Nationwide' },
];

export function TrustSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className="bg-[#071B35] py-14 text-white sm:py-16"
      aria-labelledby="trust-section-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          id="trust-section-title"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={defaultTransition}
          className="text-center text-2xl font-bold sm:text-3xl"
        >
          Customer Confidence
        </motion.h2>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRUST_ITEMS.map((stat) => (
            <motion.li
              key={stat.id}
              variants={fadeInUp}
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -4 }}
              transition={defaultTransition}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
            >
              <p className="text-3xl font-bold text-[#D8A106] sm:text-4xl">
                <AnimatedStatValue
                  value={stat.value}
                  suffix={stat.suffix}
                  text={stat.text}
                  active={isInView}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-200">{stat.label}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
