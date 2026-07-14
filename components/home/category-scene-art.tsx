'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { CategoryIllustrationId } from '@/lib/catalogue/category-visuals';

type SvgProps = {
  accent: string;
  animate: boolean;
};

const float = (animate: boolean, delay = 0) =>
  animate
    ? {
        y: [0, -8, 0],
        transition: { duration: 3.5 + delay * 0.3, repeat: Infinity, ease: 'easeInOut' as const, delay },
      }
    : undefined;

const spin = (animate: boolean, duration = 10) =>
  animate
    ? { rotate: 360, transition: { duration, repeat: Infinity, ease: 'linear' as const } }
    : undefined;

function HexBoltArt({ accent, animate }: SvgProps) {
  return (
    <g>
      <motion.g animate={float(animate)}>
        <polygon points="180,42 202,54 202,78 180,90 158,78 158,54" fill="#E2E8F0" stroke={accent} strokeWidth="2" />
        <rect x="174" y="90" width="12" height="52" rx="3" fill="#94A3B8" />
        <line x1="174" y1="100" x2="186" y2="100" stroke="#64748B" strokeWidth="2" />
        <line x1="174" y1="112" x2="186" y2="112" stroke="#64748B" strokeWidth="2" />
        <line x1="174" y1="124" x2="186" y2="124" stroke="#64748B" strokeWidth="2" />
      </motion.g>
      <motion.circle cx="52" cy="48" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5 4" animate={spin(animate, 14)} style={{ transformOrigin: '52px 48px' }} />
    </g>
  );
}

function CarriageBoltArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.2)}>
      <circle cx="180" cy="58" r="22" fill="#F8FAFC" stroke={accent} strokeWidth="2" />
      <rect x="172" y="80" width="16" height="10" fill="#CBD5E1" />
      <rect x="176" y="90" width="8" height="48" rx="2" fill="#94A3B8" />
      <path d="M168 138h24" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  );
}

function MachineBoltArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.4)}>
      <polygon points="180,36 198,46 198,66 180,76 162,66 162,46" fill="#E2E8F0" stroke={accent} strokeWidth="2" />
      <rect x="176" y="76" width="8" height="40" fill="#94A3B8" />
      <polygon points="180,116 196,126 196,142 180,152 164,142 164,126" fill={accent} opacity="0.85" />
    </motion.g>
  );
}

function StainlessBoltArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.1)}>
      <defs>
        <linearGradient id="steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <polygon points="180,40 200,52 200,74 180,86 160,74 160,52" fill="url(#steel)" stroke={accent} strokeWidth="2" />
      <rect x="174" y="86" width="12" height="50" rx="2" fill="url(#steel)" />
      <motion.ellipse cx="180" cy="58" rx="10" ry="4" fill="rgba(255,255,255,0.7)" animate={animate ? { opacity: [0.4, 0.9, 0.4] } : undefined} transition={{ duration: 2.5, repeat: Infinity }} />
    </motion.g>
  );
}

function NutArt({ accent, animate, marine = false }: SvgProps & { marine?: boolean }) {
  const fill = marine ? '#BAE6FD' : '#E2E8F0';
  return (
    <motion.g animate={float(animate, 0.3)} style={{ transformOrigin: '180px 80px' }}>
      <motion.g animate={spin(animate, 18)}>
        <polygon points="180,48 204,62 204,90 180,104 156,90 156,62" fill={fill} stroke={accent} strokeWidth="2.5" />
        <circle cx="180" cy="76" r="14" fill="none" stroke="#64748B" strokeWidth="2" />
      </motion.g>
    </motion.g>
  );
}

function WasherArt({ accent, animate, marine = false }: SvgProps & { marine?: boolean }) {
  return (
    <motion.g animate={float(animate, 0.5)}>
      <circle cx="180" cy="72" r="34" fill="none" stroke={marine ? '#E0F2FE' : '#E2E8F0'} strokeWidth="10" />
      <circle cx="180" cy="72" r="12" fill="none" stroke={accent} strokeWidth="2" />
      <motion.circle cx="180" cy="108" r="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" animate={animate ? { y: [0, 4, 0], opacity: [0.25, 0.5, 0.25] } : undefined} transition={{ duration: 3, repeat: Infinity }} />
    </motion.g>
  );
}

function StudArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.2)}>
      <rect x="172" y="36" width="16" height="88" rx="4" fill="#94A3B8" />
      <line x1="172" y1="48" x2="188" y2="48" stroke="#64748B" strokeWidth="2" />
      <line x1="172" y1="60" x2="188" y2="60" stroke="#64748B" strokeWidth="2" />
      <line x1="172" y1="72" x2="188" y2="72" stroke="#64748B" strokeWidth="2" />
      <line x1="172" y1="84" x2="188" y2="84" stroke="#64748B" strokeWidth="2" />
      <line x1="172" y1="96" x2="188" y2="96" stroke="#64748B" strokeWidth="2" />
      <rect x="168" y="118" width="24" height="8" rx="2" fill={accent} />
    </motion.g>
  );
}

function RivetArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.6)}>
      <ellipse cx="180" cy="52" rx="18" ry="10" fill="#E2E8F0" stroke={accent} strokeWidth="2" />
      <rect x="176" y="52" width="8" height="56" rx="2" fill="#94A3B8" />
      <motion.circle cx="180" cy="116" r="8" fill={accent} animate={animate ? { scale: [1, 1.15, 1] } : undefined} transition={{ duration: 2, repeat: Infinity }} />
    </motion.g>
  );
}

function AnchorBoltArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.3)}>
      <rect x="120" y="108" width="120" height="28" rx="6" fill="rgba(255,255,255,0.15)" />
      <path d="M168 108V52h24v56" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
      <path d="M156 108h48" stroke={accent} strokeWidth="8" strokeLinecap="round" />
      <path d="M156 108c0 18 12 28 24 28s24-10 24-28" fill="none" stroke={accent} strokeWidth="6" />
    </motion.g>
  );
}

function FastenerKitArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate)}>
      <rect x="130" y="48" width="100" height="72" rx="10" fill="rgba(255,255,255,0.2)" stroke={accent} strokeWidth="2" />
      <rect x="142" y="60" width="28" height="20" rx="4" fill="#E2E8F0" />
      <circle cx="198" cy="70" r="10" fill="none" stroke="#E2E8F0" strokeWidth="4" />
      <polygon points="156,98 168,90 180,98 180,114 156,114" fill={accent} opacity="0.8" />
      <rect x="190" y="94" width="8" height="28" rx="2" fill="#CBD5E1" />
    </motion.g>
  );
}

function AnchorArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.2)}>
      <circle cx="180" cy="44" r="8" fill={accent} />
      <path d="M180 52v44M156 84c8 20 48 20 48 0M168 96h24" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
      <motion.path d="M0 130 Q90 110 180 130 T360 130 V160 H0Z" fill="rgba(255,255,255,0.1)" animate={animate ? { d: ['M0 130 Q90 110 180 130 T360 130 V160 H0Z', 'M0 128 Q90 120 180 128 T360 128 V160 H0Z', 'M0 130 Q90 110 180 130 T360 130 V160 H0Z'] } : undefined} transition={{ duration: 4, repeat: Infinity }} />
    </motion.g>
  );
}

function PumpArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate)}>
      <rect x="148" y="56" width="64" height="48" rx="8" fill="rgba(255,255,255,0.2)" stroke={accent} strokeWidth="2" />
      <circle cx="180" cy="80" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" />
      <rect x="212" y="72" width="28" height="16" rx="4" fill="#CBD5E1" />
      <motion.circle cx="180" cy="80" r="6" fill={accent} animate={spin(animate, 3)} style={{ transformOrigin: '180px 80px' }} />
    </motion.g>
  );
}

function BearingArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={spin(animate, 12)} style={{ transformOrigin: '180px 80px' }}>
      <circle cx="180" cy="80" r="36" fill="none" stroke="#E2E8F0" strokeWidth="8" />
      <circle cx="180" cy="80" r="14" fill={accent} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={deg}
          cx={180 + 22 * Math.cos((deg * Math.PI) / 180)}
          cy={80 + 22 * Math.sin((deg * Math.PI) / 180)}
          r="5"
          fill="#CBD5E1"
        />
      ))}
    </motion.g>
  );
}

function AbrasiveArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={spin(animate, 6)} style={{ transformOrigin: '180px 80px' }}>
      <circle cx="180" cy="80" r="34" fill="#475569" stroke={accent} strokeWidth="3" />
      <circle cx="180" cy="80" r="10" fill="#1E293B" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1={180 + 12 * Math.cos((deg * Math.PI) / 180)}
          y1={80 + 12 * Math.sin((deg * Math.PI) / 180)}
          x2={180 + 30 * Math.cos((deg * Math.PI) / 180)}
          y2={80 + 30 * Math.sin((deg * Math.PI) / 180)}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
      ))}
    </motion.g>
  );
}

function ElectricalArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate)}>
      <path d="M188 40 L168 84 H180 L172 120 L204 72 H190 Z" fill={accent} stroke="#FEF08A" strokeWidth="2" />
      <motion.path d="M140 60h16M220 100h16" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" animate={animate ? { opacity: [0.2, 0.8, 0.2] } : undefined} transition={{ duration: 1.5, repeat: Infinity }} />
    </motion.g>
  );
}

function SafetyArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.4)}>
      <circle cx="180" cy="80" r="36" fill="rgba(255,255,255,0.15)" stroke={accent} strokeWidth="3" />
      <circle cx="180" cy="68" r="10" fill="#E2E8F0" />
      <path d="M156 118c8-18 40-18 48 0" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
    </motion.g>
  );
}

function ToolsArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.3)}>
      <path d="M152 120 L168 44 L184 44 L172 88 L196 88 L180 120 Z" fill="#E2E8F0" stroke={accent} strokeWidth="2" />
      <circle cx="196" cy="52" r="10" fill="none" stroke={accent} strokeWidth="3" />
    </motion.g>
  );
}

function WeldingArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate)}>
      <path d="M148 108 L176 52 L192 52 L168 108 Z" fill="#475569" stroke={accent} strokeWidth="2" />
      <motion.circle cx="200" cy="64" r="6" fill={accent} animate={animate ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : undefined} transition={{ duration: 1.2, repeat: Infinity }} />
      <motion.circle cx="208" cy="72" r="4" fill="#FDE047" animate={animate ? { scale: [1, 1.6, 1], opacity: [0.8, 0.2, 0.8] } : undefined} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
    </motion.g>
  );
}

function MarineArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.2)}>
      <path d="M130 96 L180 48 L230 96 L210 108 H150 Z" fill="rgba(255,255,255,0.2)" stroke={accent} strokeWidth="2" />
      <rect x="168" y="72" width="24" height="16" fill="#E2E8F0" />
      <motion.path d="M0 128 Q60 108 120 128 T240 128 T360 128 V160 H0Z" fill="rgba(255,255,255,0.12)" animate={animate ? { d: ['M0 128 Q60 108 120 128 T240 128 T360 128 V160 H0Z', 'M0 126 Q60 118 120 126 T240 126 T360 126 V160 H0Z', 'M0 128 Q60 108 120 128 T240 128 T360 128 V160 H0Z'] } : undefined} transition={{ duration: 4.5, repeat: Infinity }} />
    </motion.g>
  );
}

function IndustrialArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.5)}>
      <rect x="140" y="68" width="80" height="48" fill="rgba(255,255,255,0.15)" stroke={accent} strokeWidth="2" />
      <rect x="156" y="44" width="16" height="24" fill="#CBD5E1" />
      <rect x="188" y="44" width="16" height="24" fill="#CBD5E1" />
      <motion.circle cx="300" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="6 4" animate={spin(animate, 10)} style={{ transformOrigin: '300px 50px' }} />
    </motion.g>
  );
}

function NavigationArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={spin(animate, 20)} style={{ transformOrigin: '180px 80px' }}>
      <circle cx="180" cy="80" r="34" fill="rgba(255,255,255,0.12)" stroke={accent} strokeWidth="2" />
      <polygon points="180,52 188,88 180,80 172,88" fill={accent} />
      <circle cx="180" cy="80" r="4" fill="#E2E8F0" />
    </motion.g>
  );
}

function ChemicalsArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.4)}>
      <path d="M168 108 V72 L180 48 L192 72 V108 Z" fill="rgba(255,255,255,0.2)" stroke={accent} strokeWidth="2" />
      <rect x="164" y="108" width="32" height="10" rx="3" fill="#CBD5E1" />
      <motion.rect x="172" y="82" width="16" height="20" rx="2" fill={accent} opacity="0.6" animate={animate ? { height: [20, 28, 20], y: [82, 74, 82] } : undefined} transition={{ duration: 3, repeat: Infinity }} />
    </motion.g>
  );
}

function LiftingArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate)}>
      <path d="M156 48h48" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <line x1="180" y1="48" x2="180" y2="68" stroke="#CBD5E1" strokeWidth="3" />
      <path d="M156 68h48v12c0 14-10 24-24 24s-24-10-24-24V68z" fill="none" stroke="#E2E8F0" strokeWidth="4" />
      <rect x="148" y="108" width="64" height="16" rx="4" fill="rgba(255,255,255,0.2)" />
    </motion.g>
  );
}

function GeneralArt({ accent, animate }: SvgProps) {
  return (
    <motion.g animate={float(animate, 0.3)}>
      <rect x="148" y="52" width="64" height="64" rx="12" fill="rgba(255,255,255,0.18)" stroke={accent} strokeWidth="2" />
      <rect x="160" y="64" width="40" height="8" rx="2" fill="#E2E8F0" />
      <rect x="160" y="80" width="32" height="8" rx="2" fill="#CBD5E1" />
      <rect x="160" y="96" width="24" height="8" rx="2" fill={accent} opacity="0.7" />
    </motion.g>
  );
}

function FastenersArt({ accent, animate }: SvgProps) {
  return (
    <g>
      <motion.g animate={float(animate, 0)} style={{ transformOrigin: '156px 80px' }}>
        <polygon points="156,58 168,66 168,82 156,90 144,82 144,66" fill="#E2E8F0" stroke={accent} strokeWidth="1.5" />
        <rect x="152" y="90" width="8" height="28" rx="2" fill="#94A3B8" />
      </motion.g>
      <motion.g animate={float(animate, 0.4)} style={{ transformOrigin: '204px 76px' }}>
        <polygon points="204,64 218,74 218,94 204,104 190,94 190,74" fill={accent} opacity="0.85" />
        <circle cx="204" cy="79" r="8" fill="none" stroke="#E2E8F0" strokeWidth="2" />
      </motion.g>
    </g>
  );
}

const ART_MAP: Record<CategoryIllustrationId, (props: SvgProps) => ReactNode> = {
  'hex-bolt': HexBoltArt,
  'carriage-bolt': CarriageBoltArt,
  'machine-bolt': MachineBoltArt,
  'stainless-bolt': StainlessBoltArt,
  nut: NutArt,
  'stainless-nut': (p) => <NutArt {...p} marine />,
  washer: WasherArt,
  'stainless-washer': (p) => <WasherArt {...p} marine />,
  stud: StudArt,
  rivet: RivetArt,
  'anchor-bolt': AnchorBoltArt,
  'fastener-kit': FastenerKitArt,
  fasteners: FastenersArt,
  anchor: AnchorArt,
  pump: PumpArt,
  bearing: BearingArt,
  abrasive: AbrasiveArt,
  electrical: ElectricalArt,
  safety: SafetyArt,
  tools: ToolsArt,
  welding: WeldingArt,
  marine: MarineArt,
  industrial: IndustrialArt,
  navigation: NavigationArt,
  chemicals: ChemicalsArt,
  lifting: LiftingArt,
  general: GeneralArt,
};

type Props = {
  id: CategoryIllustrationId;
  accent: string;
  className?: string;
};

export function CategorySceneArt({ id, accent, className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const Art = ART_MAP[id] ?? GeneralArt;

  return (
    <svg viewBox="0 0 360 160" className={className} role="img" aria-hidden="true">
      <Art accent={accent} animate={!reduceMotion} />
    </svg>
  );
}
