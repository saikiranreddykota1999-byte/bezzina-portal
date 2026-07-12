'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AnimatedAccountIcon,
} from '@/components/account/animated-account-icon';
import type { AccountIconVariant } from '@/lib/account-icon-variants';
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/motion';

export type AccountDashboardLink = {
  title: string;
  href: string;
  description: string;
  variant: AccountIconVariant;
};

type Props = {
  links: AccountDashboardLink[];
};

function AccountDashboardCard({ link, index }: { link: AccountDashboardLink; index: number }) {
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const variant = link.variant;

  return (
    <motion.div
      variants={reduceMotion ? undefined : fadeInUp}
      initial={reduceMotion ? { opacity: 0 } : undefined}
      animate={reduceMotion ? { opacity: 1 } : undefined}
      transition={{ ...defaultTransition, delay: index * 0.04 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={
        reduceMotion
          ? undefined
          : {
              scale: 1.02,
              boxShadow: '0 12px 28px rgba(11, 61, 145, 0.12)',
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      className="rounded-xl border border-slate-200 bg-white transition-colors hover:border-orange-300"
      style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)' }}
    >
      <Link href={link.href} className="block p-5">
        <div className="flex items-start gap-4">
          <AnimatedAccountIcon variant={variant} isHovered={isHovered} />
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">{link.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{link.description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function AccountDashboardGrid({ links }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : 'hidden'}
      animate={reduceMotion ? { opacity: 1 } : 'visible'}
      variants={reduceMotion ? undefined : staggerContainer}
      className="mt-8 grid gap-4 sm:grid-cols-2"
    >
      {links.map((link, index) => (
        <AccountDashboardCard key={link.href} link={link} index={index} />
      ))}
    </motion.div>
  );
}
