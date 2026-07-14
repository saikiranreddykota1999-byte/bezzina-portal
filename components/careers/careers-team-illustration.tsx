'use client';

import { motion, useReducedMotion } from 'framer-motion';

const brand = {
  blue: '#0B3D91',
  gold: '#D8A106',
  navy: '#071B35',
  skin: '#F5C9A8',
  skinAlt: '#E8B090',
  shirtBlue: '#3B82F6',
  shirtTeal: '#0E7490',
  shirtOrange: '#EA580C',
  pants: '#334155',
};

type Props = {
  className?: string;
};

function WorkerHead({ cx, cy, hair = 'short' }: { cx: number; cy: number; hair?: 'short' | 'ponytail' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill={brand.skin} />
      {hair === 'ponytail' ? (
        <>
          <ellipse cx={cx - 10} cy={cy - 2} rx="5" ry="8" fill="#4B3621" />
          <path d={`M${cx - 6} ${cy - 8} Q${cx} ${cy - 14} ${cx + 6} ${cy - 8}`} fill="#4B3621" />
        </>
      ) : (
        <path d={`M${cx - 10} ${cy - 4} Q${cx} ${cy - 14} ${cx + 10} ${cy - 4}`} fill="#3F2E1F" />
      )}
    </g>
  );
}

function HardHat({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M${cx - 14} ${cy - 6} Q${cx} ${cy - 18} ${cx + 14} ${cy - 6} L${cx + 12} ${cy} L${cx - 12} ${cy} Z`}
      fill={brand.gold}
      stroke={brand.navy}
      strokeWidth="1.5"
    />
  );
}

export function CareersHeroIllustration({ className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const float = (delay = 0) =>
    reduceMotion
      ? undefined
      : { y: [0, -6, 0], transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' as const, delay } };

  return (
    <svg
      viewBox="0 0 520 340"
      className={className}
      role="img"
      aria-label="Team members working in warehouse, office, and delivery roles"
    >
      <defs>
        <linearGradient id="careers-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8EFF9" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      <rect width="520" height="340" rx="24" fill="url(#careers-bg)" />

      {/* Warehouse shelves */}
      <rect x="36" y="88" width="120" height="8" rx="2" fill={brand.blue} opacity="0.25" />
      <rect x="36" y="118" width="120" height="8" rx="2" fill={brand.blue} opacity="0.2" />
      <rect x="36" y="148" width="120" height="8" rx="2" fill={brand.blue} opacity="0.15" />
      <rect x="40" y="72" width="8" height="168" fill={brand.blue} opacity="0.2" />
      <rect x="144" y="72" width="8" height="168" fill={brand.blue} opacity="0.2" />

      <motion.g animate={float(0)}>
        <rect x="52" y="96" width="28" height="18" rx="3" fill="#CBD5E1" />
        <rect x="88" y="96" width="22" height="18" rx="3" fill="#94A3B8" />
        <rect x="52" y="126" width="34" height="18" rx="3" fill="#94A3B8" />
      </motion.g>

      {/* Woman warehouse supervisor with clipboard */}
      <motion.g animate={float(0.2)}>
        <HardHat cx={118} cy={168} />
        <WorkerHead cx={118} cy={182} hair="ponytail" />
        <rect x="104" y="194" width="28" height="42" rx="8" fill={brand.shirtTeal} />
        <rect x="108" y="236" width="10" height="36" rx="4" fill={brand.pants} />
        <rect x="122" y="236" width="10" height="36" rx="4" fill={brand.pants} />
        <rect x="132" y="206" width="22" height="28" rx="4" fill="#fff" stroke={brand.blue} strokeWidth="2" />
        <line x1="136" y1="214" x2="150" y2="214" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="136" y1="222" x2="148" y2="222" stroke="#CBD5E1" strokeWidth="2" />
        <motion.g
          animate={reduceMotion ? undefined : { rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '142px 220px' }}
        >
          <rect x="138" y="218" width="10" height="2" rx="1" fill={brand.gold} />
        </motion.g>
      </motion.g>

      {/* Man carrying box */}
      <motion.g animate={float(0.5)}>
        <WorkerHead cx={232} cy={156} />
        <rect x="218" y="168" width="28" height="46" rx="8" fill={brand.shirtBlue} />
        <rect x="222" y="214" width="10" height="40" rx="4" fill={brand.pants} />
        <rect x="236" y="214" width="10" height="40" rx="4" fill={brand.pants} />
        <motion.rect
          x="248"
          y="178"
          width="36"
          height="28"
          rx="4"
          fill="#D97706"
          stroke={brand.navy}
          strokeWidth="1.5"
          animate={reduceMotion ? undefined : { x: [248, 252, 248] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <line x1="254" y1="186" x2="278" y2="186" stroke={brand.gold} strokeWidth="2" />
      </motion.g>

      {/* Woman at desk — sales / admin */}
      <motion.g animate={float(0.8)}>
        <rect x="330" y="210" width="88" height="52" rx="6" fill="#fff" stroke={brand.blue} strokeWidth="2" />
        <rect x="342" y="222" width="48" height="30" rx="3" fill="#E8EFF9" />
        <rect x="396" y="228" width="12" height="20" rx="2" fill="#CBD5E1" />
        <WorkerHead cx={378} cy={178} hair="ponytail" />
        <rect x="364" y="190" width="28" height="34" rx="8" fill="#7C3AED" opacity="0.85" />
        <motion.rect
          x="348"
          y="228"
          width="20"
          height="3"
          rx="1.5"
          fill={brand.blue}
          animate={reduceMotion ? undefined : { width: [12, 24, 12] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>

      {/* Man delivery / driver */}
      <motion.g
        animate={reduceMotion ? undefined : { x: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="52" y="248" width="96" height="44" rx="8" fill={brand.blue} />
        <rect x="148" y="260" width="36" height="32" rx="6" fill={brand.blue} opacity="0.85" />
        <circle cx="76" cy="296" r="10" fill={brand.navy} />
        <circle cx="164" cy="296" r="10" fill={brand.navy} />
        <WorkerHead cx={170} cy={248} />
        <rect x="158" y="258" width="22" height="28" rx="6" fill={brand.shirtOrange} />
        <rect x="108" y="268" width="34" height="18" rx="3" fill="#FDE68A" opacity="0.8" />
      </motion.g>

      {/* Floating accents */}
      {!reduceMotion && (
        <>
          <motion.circle
            cx="300"
            cy="72"
            r="5"
            fill={brand.gold}
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="420"
            cy="96"
            r="4"
            fill={brand.blue}
            opacity="0.4"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: 0.4 }}
          />
        </>
      )}

      <rect x="36" y="300" width="448" height="8" rx="4" fill={brand.blue} opacity="0.08" />
    </svg>
  );
}

type MiniScene = 'warehouse' | 'team' | 'delivery' | 'growth';

export function CareersMiniScene({ scene, className = '' }: { scene: MiniScene; className?: string }) {
  const reduceMotion = useReducedMotion();
  const float = reduceMotion
    ? undefined
    : { y: [0, -4, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const } };

  if (scene === 'warehouse') {
    return (
      <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
        <rect width="200" height="140" rx="16" fill="#E8EFF9" />
        <motion.g animate={float}>
          <HardHat cx={72} cy={52} />
          <WorkerHead cx={72} cy={66} />
          <rect x="58" y="78" width="28" height="36" rx="6" fill={brand.shirtTeal} />
          <rect x="96" y="84" width="32" height="24" rx="4" fill="#D97706" />
        </motion.g>
      </svg>
    );
  }

  if (scene === 'team') {
    return (
      <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
        <rect width="200" height="140" rx="16" fill="#FEF3C7" />
        <motion.g animate={float}>
          <WorkerHead cx={60} cy={62} hair="ponytail" />
          <rect x="48" y="74" width="24" height="32" rx="6" fill="#7C3AED" opacity="0.8" />
          <WorkerHead cx={100} cy={58} />
          <rect x="88" y="70" width="24" height="36" rx="6" fill={brand.shirtBlue} />
          <WorkerHead cx={140} cy={64} hair="ponytail" />
          <rect x="128" y="76" width="24" height="32" rx="6" fill={brand.shirtTeal} />
        </motion.g>
      </svg>
    );
  }

  if (scene === 'delivery') {
    return (
      <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
        <rect width="200" height="140" rx="16" fill="#DBEAFE" />
        <motion.g
          animate={reduceMotion ? undefined : { x: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="40" y="78" width="72" height="32" rx="6" fill={brand.blue} />
          <circle cx="58" cy="114" r="8" fill={brand.navy} />
          <circle cx="96" cy="114" r="8" fill={brand.navy} />
          <WorkerHead cx={118} cy={68} />
          <rect x="108" y="78" width="20" height="26" rx="5" fill={brand.shirtOrange} />
        </motion.g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <rect width="200" height="140" rx="16" fill="#ECFDF5" />
      <motion.g animate={float}>
        <rect x="88" y="96" width="24" height="8" rx="2" fill={brand.blue} opacity="0.3" />
        <rect x="80" y="80" width="40" height="8" rx="2" fill={brand.blue} opacity="0.45" />
        <rect x="72" y="64" width="56" height="8" rx="2" fill={brand.blue} opacity="0.6" />
        <WorkerHead cx={100} cy={48} />
        <rect x="88" y="60" width="24" height="28" rx="6" fill={brand.shirtBlue} />
        <motion.path
          d="M128 72 L140 60 L152 72"
          fill="none"
          stroke={brand.gold}
          strokeWidth="3"
          strokeLinecap="round"
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.g>
    </svg>
  );
}
