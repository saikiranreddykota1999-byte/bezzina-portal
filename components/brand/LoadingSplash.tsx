'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { company } from '@/config/company';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';

type Props = {
  onComplete?: () => void;
  minDurationMs?: number;
};

export function LoadingSplash({ onComplete, minDurationMs = 1400 }: Props) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / minDurationMs) * 100);
      setProgress(next);
      if (elapsed < minDurationMs) {
        frame = requestAnimationFrame(tick);
        return;
      }
      onComplete?.();
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [minDurationMs, onComplete]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading admin portal"
      className="brand-loading-splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="brand-loading-splash__content">
        <AnimatedLogo variant="splash" animate priority />
        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="brand-loading-splash__ring"
          aria-hidden
        />
        <p className="mt-8 text-center text-lg font-bold text-white">{company.shortName}</p>
        <p className="mt-2 max-w-md text-center text-sm text-white/75">{company.tagline}</p>
        <div className="brand-loading-splash__bar" aria-hidden>
          <motion.span
            className="brand-loading-splash__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
