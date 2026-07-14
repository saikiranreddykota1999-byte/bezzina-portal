'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { company } from '@/config/company';
import { BezzinaLogoSvg } from '@/components/brand/bezzina-logo-svg';
import { logoSizes, type LogoVariant } from '@/lib/brand-logo';

type Props = {
  variant: LogoVariant;
  href?: string;
  showCompanyName?: boolean;
  companyNameClassName?: string;
  animate?: boolean;
  hoverable?: boolean;
  priority?: boolean;
  className?: string;
  ariaLabel?: string;
};

const glowKeyframes: Variants = {
  initial: { opacity: 0.35, scale: 0.92 },
  animate: {
    opacity: [0.35, 0.65, 0.35],
    scale: [0.92, 1.05, 0.92],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const floatKeyframes: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
};

function svgVariantFor(variant: LogoVariant): 'mark' | 'wordmark' | 'compact' {
  if (variant === 'admin-login-hero') return 'wordmark';
  if (
    variant === 'admin-login-card' ||
    variant === 'header-desktop' ||
    variant === 'footer' ||
    variant === 'contact'
  ) {
    return 'compact';
  }
  return 'mark';
}

function svgClassFor(variant: LogoVariant): string {
  const size = logoSizes[variant];
  return `${size.imageClass} brand-logo-svg`;
}

export function AnimatedLogo({
  variant,
  href,
  showCompanyName = false,
  companyNameClassName = '',
  animate = false,
  hoverable = false,
  priority = false,
  className = '',
  ariaLabel,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isHero = variant === 'admin-login-hero';
  const isSplash = variant === 'splash';
  const canAnimate = animate && !reduceMotion;
  const canHover = hoverable && !reduceMotion;
  void priority;

  const imageNode = (
    <motion.div
      className={[
        'relative inline-flex shrink-0 items-center justify-center',
        isHero ? 'rounded-full p-6' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      initial={canAnimate ? { opacity: 0, scale: 0.8, rotate: -5 } : false}
      animate={canAnimate ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      transition={canAnimate ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] } : undefined}
      whileHover={
        canHover
          ? {
              scale: 1.04,
              rotate: 1,
              filter: 'drop-shadow(0 0 10px rgba(216, 161, 6, 0.35))',
              transition: { duration: 0.3 },
            }
          : undefined
      }
    >
      {isHero && canAnimate ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(216,161,6,0.45)_0%,rgba(216,161,6,0)_70%)]"
          variants={glowKeyframes}
          initial="initial"
          animate="animate"
        />
      ) : null}

      {canHover ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[0_0_24px_rgba(216,161,6,0.35)] transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : null}

      <motion.div
        className={isHero ? 'brand-logo-glass relative z-[1] rounded-full p-4' : 'relative z-[1]'}
        variants={isHero || isSplash ? floatKeyframes : undefined}
        animate={isHero || isSplash ? 'animate' : undefined}
      >
        <BezzinaLogoSvg
          variant={svgVariantFor(variant)}
          className={svgClassFor(variant)}
          title={company.name}
        />
      </motion.div>
    </motion.div>
  );

  const content = (
    <div className="group inline-flex items-center gap-3 sm:gap-4">
      {imageNode}
      {showCompanyName ? (
        <div className={`min-w-0 ${companyNameClassName}`}>
          <p className="truncate text-sm font-bold leading-tight text-slate-900 md:text-base lg:text-[1.05rem]">
            {company.name}
          </p>
          <p className="mt-0.5 hidden truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B3D91] sm:block">
            {company.invoice.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        aria-label={ariaLabel ?? `${company.name} home`}
      >
        {content}
      </Link>
    );
  }

  return <div aria-label={ariaLabel}>{content}</div>;
}
