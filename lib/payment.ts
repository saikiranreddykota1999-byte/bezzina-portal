/** Demo checkout is a local/dev convenience only — never in production. */
export function isDemoPaymentAllowed(
  stripeEnabled: boolean,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  if (nodeEnv === 'production') {
    return false;
  }
  return !stripeEnabled;
}

export function detectCardBrand(value: string): import('@/types/payment').PaymentCard['brand'] {
  const n = value.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'other';
}
