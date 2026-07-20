'use client';

import { motion, useReducedMotion } from 'framer-motion';

type AskBezzinaAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  attentive?: boolean;
  className?: string;
};

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-[4.25rem] w-[4.25rem]',
} as const;

/**
 * Bezzina assistant mark — animated bolt + nut inspired by the company logo.
 */
export function AskBezzinaAvatar({
  size = 'md',
  attentive = true,
  className = '',
}: AskBezzinaAvatarProps) {
  const reduceMotion = useReducedMotion();
  const animate = Boolean(attentive && !reduceMotion);

  return (
    <span
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      {animate ? (
        <span className="ask-bezzina-pulse absolute inset-[-3px] rounded-full bg-[#D8A106]/25" />
      ) : null}

      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_28%,#1a56b8_0%,#0B3D91_48%,#071B35_100%)] shadow-[inset_0_-6px_12px_rgba(0,0,0,0.28),0_8px_18px_rgba(7,27,53,0.28)] ring-[1.5px] ring-[#D8A106]/75">
        <span
          className="pointer-events-none absolute inset-x-2 top-1 h-2.5 rounded-full bg-white/15 blur-[1px]"
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 64 64"
          className="relative h-[74%] w-[74%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="23" fill="#071B35" opacity="0.28" />

          {/* Hex nut — rotates when attentive */}
          <motion.g
            style={{ transformOrigin: '32px 28px' }}
            animate={animate ? { rotate: 360 } : { rotate: 0 }}
            transition={
              animate
                ? { duration: 8, ease: 'linear', repeat: Infinity }
                : { duration: 0 }
            }
          >
            <path
              d="M32 12L43.5 18.5V31.5L32 38L20.5 31.5V18.5L32 12Z"
              fill="#D8A106"
            />
            <path
              d="M32 15.5L40.6 20.4V29.6L32 34.5L23.4 29.6V20.4L32 15.5Z"
              fill="#F0C14A"
            />
            <circle cx="32" cy="25" r="5.4" fill="#071B35" />
            <circle cx="32" cy="25" r="3.2" fill="#0B3D91" />
            {/* light catch */}
            <path
              d="M26 18.5L32 15.2L35.5 17.2L29.8 20.8L26 18.5Z"
              fill="#FFE08A"
              opacity="0.55"
            />
          </motion.g>

          {/* Bolt — gentle drive motion */}
          <motion.g
            animate={animate ? { x: [0, 2.2, 0] } : { x: 0 }}
            transition={
              animate
                ? { duration: 2.6, ease: 'easeInOut', repeat: Infinity }
                : { duration: 0 }
            }
          >
            <rect x="13" y="40" width="32" height="6" rx="1.2" fill="#D8A106" />
            <path
              d="M17 40.2H41"
              stroke="#9A7208"
              strokeWidth="0.8"
              strokeDasharray="1.5 1.3"
              opacity="0.85"
            />
            <path
              d="M17 45.8H41"
              stroke="#9A7208"
              strokeWidth="0.8"
              strokeDasharray="1.5 1.3"
              opacity="0.85"
            />
            <rect x="7.5" y="37.6" width="8" height="10.8" rx="1.7" fill="#F0C14A" />
            <rect x="9.6" y="41.4" width="3.8" height="1.4" rx="0.4" fill="#071B35" opacity="0.5" />
            <path d="M45 40L52 43L45 46V40Z" fill="#D8A106" />
            <path d="M45 41.2L49.4 43L45 44.8V41.2Z" fill="#FFE08A" opacity="0.45" />
          </motion.g>
        </svg>
      </span>
    </span>
  );
}
