'use client';

import { motion } from 'framer-motion';
import { pageTransition, defaultTransition } from '@/lib/motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
}
