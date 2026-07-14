'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { company } from '@/config/company';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';
import { LogoWatermark } from '@/components/brand/LogoWatermark';

export function LoginHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="admin-login-hero relative z-[1] hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14"
      aria-labelledby="admin-login-hero-title"
    >
      <LogoWatermark variant="admin-login" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1]"
      >
        <AnimatedLogo variant="admin-login-hero" animate priority />
        <h1
          id="admin-login-hero-title"
          className="mt-10 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl"
        >
          {company.name}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 xl:text-lg">
          {company.tagline}
        </p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
          Est. {company.founded}
        </p>
      </motion.div>

      <p className="relative z-[1] text-sm text-white/50">
        &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
      </p>
    </section>
  );
}
