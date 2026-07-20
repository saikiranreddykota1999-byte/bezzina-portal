/** Demo checkout card number helpers (never store real PANs). */

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16);
}
