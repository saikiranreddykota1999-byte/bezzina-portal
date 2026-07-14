'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { company } from '@/config/company';
import { BezzinaLogoSvg } from '@/components/brand/bezzina-logo-svg';
import { LogoWatermark } from '@/components/brand/LogoWatermark';

export function LoginHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="admin-login-hero relative z-[1] hidden w-1/2 flex-col items-center justify-center overflow-hidden p-8 lg:flex xl:p-12"
      aria-labelledby="admin-login-hero-title"
    >
      <LogoWatermark variant="admin-login" />

      <motion.div
        className="login-hero-bubble relative z-[1] flex w-full max-w-xl flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {!reduceMotion && (
          <>
            <motion.span
              aria-hidden
              className="login-hero-bubble__ring login-hero-bubble__ring--outer"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
            <motion.span
              aria-hidden
              className="login-hero-bubble__ring login-hero-bubble__ring--inner"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <motion.span
              aria-hidden
              className="login-hero-bubble__glow"
              animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        <motion.div
          className="login-hero-bubble__glass"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="login-hero-bubble__logo"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <BezzinaLogoSvg variant="wordmark" className="h-auto w-full max-w-[320px]" />
          </motion.div>

          <motion.div
            className="login-hero-bubble__details mt-8 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            <h1
              id="admin-login-hero-title"
              className="text-2xl font-bold tracking-tight text-white xl:text-3xl"
            >
              {company.name}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/90 xl:text-base">
              {company.tagline}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D8A106]/40 bg-[#D8A106]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#F5D061]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8A106] animate-pulse" />
              Est. {company.founded}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      <p className="relative z-[1] mt-10 text-center text-xs text-white/45">
        &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
      </p>
    </section>
  );
}
