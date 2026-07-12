'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ACCOUNT_ICON_THEMES,
  type AccountIconVariant,
} from '@/lib/account-icon-variants';

type Props = {
  variant: AccountIconVariant;
  isHovered?: boolean;
};

const quickTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

export function AnimatedAccountIcon({ variant, isHovered = false }: Props) {
  const reduceMotion = useReducedMotion();
  const theme = ACCOUNT_ICON_THEMES[variant];
  const Icon = theme.icon;

  if (reduceMotion) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.containerClass}`}
      >
        <Icon className={`h-5 w-5 ${theme.iconClass}`} aria-hidden="true" />
      </motion.span>
    );
  }

  const containerIdle =
    variant === 'tracking' || variant === 'cart'
      ? { x: [0, 3, 0] }
      : { y: [0, -2, 0] };

  const iconAnimate = isHovered ? getHoverIconMotion(variant) : getIdleIconMotion(variant);
  const iconTransition = isHovered
    ? quickTransition
    : { duration: 2.6, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

  return (
    <motion.span
      animate={containerIdle}
      transition={{ duration: 2.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ${theme.containerClass}`}
    >
      <span
        aria-hidden="true"
        className={`absolute -right-1 -top-1 h-5 w-5 rounded-full blur-sm ${theme.glowClass}`}
      />

      {variant === 'payment-cards' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/75 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      ) : null}

      {variant === 'quote-history' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-2 right-2 h-0.5 rounded-full bg-[#334155]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={quickTransition}
          style={{ originX: 0 }}
        />
      ) : null}

      {variant === 'notifications' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EAB308]"
          animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      ) : null}

      {variant === 'suggestions' && isHovered ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-1 rounded-lg bg-white/25"
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      ) : null}

      <motion.span animate={iconAnimate} transition={iconTransition} className="relative z-10">
        <Icon
          className={`h-5 w-5 ${theme.iconClass} ${
            isHovered && theme.hoverIconClass ? theme.hoverIconClass : ''
          }`}
          aria-hidden="true"
        />
      </motion.span>
    </motion.span>
  );
}

function getIdleIconMotion(variant: AccountIconVariant) {
  switch (variant) {
    case 'profile':
    case 'password':
      return { scale: [1, 1.05, 1] };
    case 'recently-viewed':
    case 'notifications':
      return { rotate: [0, 8, 0] };
    case 'downloads':
    case 'cart':
      return { y: [0, 2, 0] };
    case 'tracking':
      return { x: [0, 4, 0] };
    case 'suggestions':
      return { scale: [1, 1.04, 1] };
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
      return { rotateY: [0, 14, 0] };
    case 'orders':
    case 'cart':
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
    case 'checkout':
      return { scale: [1, 1.1, 1] };
    case 'payment':
      return { y: [0, -3, 0] };
    case 'notifications':
      return { rotate: [0, -12, 12, 0] };
    case 'support-tickets':
      return { scale: [1, 1.08, 1] };
    case 'suggestions':
      return { rotate: [0, -6, 6, 0] };
    case 'password':
      return { rotate: [0, -10, 0] };
    default:
      return { scale: 1.05 };
  }
}

export type { AccountIconVariant };
