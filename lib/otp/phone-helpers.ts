export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;

  if (input.trim().startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.startsWith('356')) {
    return `+${digits}`;
  }

  if (digits.length === 8) {
    return `+356${digits}`;
  }

  return `+${digits}`;
}

export function phoneToSyntheticEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@phone.otp.bezzina`;
}
