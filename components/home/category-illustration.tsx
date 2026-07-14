'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CategorySceneArt } from '@/components/home/category-scene-art';
import type { CategoryVisual } from '@/lib/catalogue/category-visuals';

type Props = {
  visual: CategoryVisual;
  name: string;
  className?: string;
};

export function CategoryIllustration({ visual, name, className = '' }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${visual.gradientFrom} 0%, ${visual.gradientTo} 100%)`,
      }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 22%, ${visual.glow} 0%, transparent 50%), radial-gradient(circle at 88% 78%, rgba(255,255,255,0.18) 0%, transparent 42%)`,
        }}
      />

      {!reduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 skew-x-12 bg-white/15"
            animate={{ x: ['-120%', '420%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          />
          <motion.div
            className="pointer-events-none absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-white/40"
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-white/50"
            animate={{ y: [0, 10, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </>
      )}

      <CategorySceneArt
        id={visual.illustrationId}
        accent={visual.accent}
        className="absolute inset-0 h-full w-full"
      />

      <span className="sr-only">{name} category illustration</span>
    </div>
  );
}
