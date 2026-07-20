'use client';

import { useReducedMotion } from 'framer-motion';

type AskBezzinaAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  /** Soft ring pulse when idle / ready to help */
  attentive?: boolean;
  className?: string;
};

const sizeMap = {
  sm: { face: 'h-9 w-9', eye: 'h-2 w-1.5', gap: 'gap-1.5', pupil: 'h-1 w-1' },
  md: { face: 'h-14 w-14', eye: 'h-2.5 w-2', gap: 'gap-2', pupil: 'h-1.5 w-1.5' },
  lg: { face: 'h-16 w-16', eye: 'h-3 w-2.5', gap: 'gap-2.5', pupil: 'h-2 w-2' },
} as const;

/**
 * Friendly Bezzina assistant face — blinking eyes, ready to help.
 * Honours prefers-reduced-motion (static open eyes).
 */
export function AskBezzinaAvatar({
  size = 'md',
  attentive = true,
  className = '',
}: AskBezzinaAvatarProps) {
  const reduceMotion = useReducedMotion();
  const dims = sizeMap[size];

  return (
    <span
      className={`relative inline-flex items-center justify-center ${dims.face} ${className}`}
      aria-hidden="true"
    >
      {attentive && !reduceMotion ? (
        <span className="ask-bezzina-pulse absolute inset-0 rounded-full bg-[#D8A106]/20" />
      ) : null}

      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0B3D91] to-[#071B35] shadow-inner ring-2 ring-white/25">
        <span className={`flex items-center ${dims.gap}`}>
          <Eye
            className={dims.eye}
            pupilClassName={dims.pupil}
            animate={!reduceMotion}
            delayClass=""
          />
          <Eye
            className={dims.eye}
            pupilClassName={dims.pupil}
            animate={!reduceMotion}
            delayClass="ask-bezzina-eye-delay"
          />
        </span>
      </span>
    </span>
  );
}

function Eye({
  className,
  pupilClassName,
  animate,
  delayClass,
}: {
  className: string;
  pupilClassName: string;
  animate: boolean;
  delayClass: string;
}) {
  return (
    <span
      className={`relative flex items-center justify-center overflow-hidden rounded-full bg-white ${className} ${
        animate ? `ask-bezzina-blink ${delayClass}` : ''
      }`}
    >
      <span
        className={`absolute rounded-full bg-[#071B35] ${pupilClassName} ${
          animate ? 'ask-bezzina-glance' : ''
        }`}
      />
    </span>
  );
}
