import { createHash, randomInt } from 'crypto';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_SEND_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 15;
const MAX_VERIFY_ATTEMPTS = 5;

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

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

function getOtpPepper(): string {
  return (
    process.env.OTP_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'bezzina-otp-dev-pepper'
  );
}

export function hashOtpCode(phone: string, code: string): string {
  return createHash('sha256')
    .update(`${phone}:${code}:${getOtpPepper()}`)
    .digest('hex');
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export function getSendWindowStart(): Date {
  return new Date(Date.now() - SEND_WINDOW_MINUTES * 60 * 1000);
}

export const otpConfig = {
  OTP_LENGTH,
  OTP_TTL_MINUTES,
  MAX_SEND_PER_WINDOW,
  SEND_WINDOW_MINUTES,
  MAX_VERIFY_ATTEMPTS,
};
