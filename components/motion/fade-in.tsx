'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { fadeIn, defaultTransition } from '@/lib/motion';

type FadeInProps = HTMLMotionProps<'div'> & {
  delay?: number;
};

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeIn}
      transition={{ ...defaultTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
