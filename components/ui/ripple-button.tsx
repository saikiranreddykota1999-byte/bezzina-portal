'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, type MouseEvent, type ReactNode } from 'react';

type RippleButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary: 'bg-[#0B3D91] text-white hover:bg-[#09407a]',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  ghost: 'border border-slate-300 text-slate-900 hover:bg-slate-50',
};

export function RippleButton({
  href,
  onClick,
  children,
  className = '',
  type = 'button',
  variant = 'primary',
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  function handleRipple(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { x: event.clientX - rect.left, y: event.clientY - rect.top, id },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }

  const classes = `relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${variants[variant]} ${className}`;

  const content = (
    <>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
          animate={{ width: 180, height: 180, x: -90, y: -90, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={handleRipple}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      className={classes}
      onClick={(e) => {
        handleRipple(e);
        onClick?.();
      }}
    >
      {content}
    </motion.button>
  );
}
