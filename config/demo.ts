/**
 * Demo mode gates mock checkout and payment-card flows.
 * Set NEXT_PUBLIC_DEMO_MODE=false when a real payment provider is integrated.
 */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
