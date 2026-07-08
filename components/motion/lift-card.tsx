'use client';

import { motion } from 'framer-motion';
import { cardHover, defaultTransition } from '@/lib/motion';

type LiftCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function LiftCard({ children, className }: LiftCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
