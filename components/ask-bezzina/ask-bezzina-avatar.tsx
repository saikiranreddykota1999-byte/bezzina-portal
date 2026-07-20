'use client';

import { useReducedMotion } from 'framer-motion';

type AskBezzinaAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  attentive?: boolean;
  className?: string;
};

const sizeMap = {
  sm: {
    face: 'h-10 w-10',
    eyeWrap: 'h-[11px] w-[9px]',
    gap: 'gap-[5px]',
    pupil: 'h-[5px] w-[5px]',
    ring: 'ring-[1.5px]',
  },
  md: {
    face: 'h-14 w-14',
    eyeWrap: 'h-3.5 w-3',
    gap: 'gap-2',
    pupil: 'h-2 w-2',
    ring: 'ring-2',
  },
  lg: {
    face: 'h-[4.25rem] w-[4.25rem]',
    eyeWrap: 'h-4 w-3.5',
    gap: 'gap-2.5',
    pupil: 'h-2.5 w-2.5',
    ring: 'ring-2',
  },
} as const;

/**
 * Bezzina assistant face — blinking eyes with a refined industrial look.
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
        <span className="ask-bezzina-pulse absolute inset-[-3px] rounded-full bg-[#D8A106]/25" />
      ) : null}

      <span
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#1a56b8_0%,#0B3D91_45%,#071B35_100%)] ${dims.ring} ring-[#D8A106]/70 shadow-[inset_0_-6px_12px_rgba(0,0,0,0.25),0_8px_18px_rgba(7,27,53,0.28)]`}
      >
        <span
          className="pointer-events-none absolute inset-x-2 top-1 h-3 rounded-full bg-white/20 blur-[2px]"
          aria-hidden="true"
        />
        <span className={`relative flex items-center ${dims.gap}`}>
          <Eye
            wrapClassName={dims.eyeWrap}
            pupilClassName={dims.pupil}
            animate={!reduceMotion}
            delayClass=""
          />
          <Eye
            wrapClassName={dims.eyeWrap}
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
  wrapClassName,
  pupilClassName,
  animate,
  delayClass,
}: {
  wrapClassName: string;
  pupilClassName: string;
  animate: boolean;
  delayClass: string;
}) {
  return (
    <span
      className={`relative flex items-center justify-center overflow-hidden rounded-[40%] bg-white shadow-[inset_0_1px_2px_rgba(7,27,53,0.15)] ${wrapClassName} ${
        animate ? `ask-bezzina-blink ${delayClass}` : ''
      }`}
    >
      <span
        className={`absolute rounded-full bg-[#071B35] shadow-[0_0_0_1px_rgba(216,161,6,0.35)] ${pupilClassName} ${
          animate ? 'ask-bezzina-glance' : ''
        }`}
      />
      <span
        className="absolute left-[22%] top-[18%] h-[2px] w-[2px] rounded-full bg-white/90"
        aria-hidden="true"
      />
    </span>
  );
}
