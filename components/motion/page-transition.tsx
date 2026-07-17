'use client';

/**
 * Lightweight page enter animation without Framer Motion —
 * keeps navigation hydration cost low while preserving a soft transition.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
