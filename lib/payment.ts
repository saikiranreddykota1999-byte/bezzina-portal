import type { PaymentCard } from '@/types/payment';

export function detectCardBrand(value: string): PaymentCard['brand'] {
  const n = value.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'other';
}
