'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bookmark,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Heart,
  MapPin,
  Package,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react';

export type AccountIconVariant =
  | 'profile'
  | 'addresses'
  | 'payment-cards'
  | 'orders'
  | 'quote-history'
  | 'quote-drafts'
  | 'recently-viewed'
  | 'downloads'
  | 'favourites'
  | 'tracking'
  | 'default';

const VARIANT_ICONS: Record<AccountIconVariant, LucideIcon> = {
  profile: User,
  addresses: MapPin,
  'payment-cards': CreditCard,
  orders: Package,
  'quote-history': FileText,
  'quote-drafts': Bookmark,
  'recently-viewed': Clock3,
  downloads: Download,
  favourites: Heart,
  tracking: Truck,
  default: Package,
};

type Props = {
  variant: AccountIconVariant;
  isHovered?: boolean;
};

const quickTransition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

export function AnimatedAccountIcon({ variant, isHovered = false }: Props) {
  const reduceMotion = useReducedMotion();
  const Icon = VARIANT_ICONS[variant];

  if (reduceMotion) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </motion.span>
    );
  }

  const idleFloat =
    variant === 'tracking'
      ? { x: [0, 3, 0] }
      : { y: [0, -2, 0] };

  const iconAnimate = isHovered ? getHoverIconMotion(variant) : getIdleIconMotion(variant);
  const iconTransition = isHovered
    ? quickTransition
    : { duration: 2.6, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

  return (
    <motion.span
      animate={idleFloat}
      transition={{ duration: 2.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E8EFF9] text-[#0B3D91]"
    >
      {variant === 'payment-cards' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      ) : null}

      {variant === 'quote-history' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-2 right-2 h-0.5 rounded-full bg-[#0B3D91]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={quickTransition}
          style={{ originX: 0 }}
        />
      ) : null}

      <motion.span animate={iconAnimate} transition={iconTransition} className="relative z-10">
        <Icon
          className={`h-5 w-5 ${variant === 'favourites' && isHovered ? 'fill-red-500 text-red-500' : ''}`}
          aria-hidden="true"
        />
      </motion.span>
    </motion.span>
  );
}

function getIdleIconMotion(variant: AccountIconVariant) {
  switch (variant) {
    case 'profile':
      return { scale: [1, 1.05, 1] };
    case 'recently-viewed':
      return { rotate: [0, 10, 0] };
    case 'downloads':
      return { y: [0, 2, 0] };
    case 'tracking':
      return { x: [0, 4, 0] };
    default:
      return {};
  }
}

function getHoverIconMotion(variant: AccountIconVariant) {
  switch (variant) {
    case 'profile':
      return { scale: [1, 1.08, 1] };
    case 'addresses':
      return { y: [0, -4, 0] };
    case 'payment-cards':
      return { rotateY: [0, 12, 0] };
    case 'orders':
      return { rotate: [0, -8, 0] };
    case 'quote-history':
      return { x: [0, 2, 0] };
    case 'quote-drafts':
      return { scale: [1, 1.12, 1] };
    case 'recently-viewed':
      return { rotate: [0, 18, 0] };
    case 'downloads':
      return { y: [0, 4, -2, 0] };
    case 'favourites':
      return { scale: [1, 1.15, 1] };
    case 'tracking':
      return { x: [0, 5, 0] };
    default:
      return { scale: 1.05 };
  }
}
