const PICKUP_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePickupCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += PICKUP_CODE_CHARS[Math.floor(Math.random() * PICKUP_CODE_CHARS.length)];
  }
  return `PKP-${suffix}`;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `JB-${year}-${suffix}`;
}

export function normalizeTimeValue(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
