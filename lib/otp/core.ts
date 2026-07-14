import { createHash, randomInt } from 'crypto';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_SEND_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 15;
const MAX_VERIFY_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

function getOtpPepper(): string {
  const secret = process.env.OTP_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('OTP_SECRET must be set in production');
  }

  return 'bezzina-otp-dev-pepper';
}

export function hashOtpCode(identifier: string, code: string): string {
  return createHash('sha256')
    .update(`${identifier}:${code}:${getOtpPepper()}`)
    .digest('hex');
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export function getSendWindowStart(): Date {
  return new Date(Date.now() - SEND_WINDOW_MINUTES * 60 * 1000);
}

export function buildOtpForStorage(identifier: string) {
  const code = generateOtpCode();
  return {
    code,
    codeHash: hashOtpCode(identifier, code),
    expiresAt: getOtpExpiryDate(),
    sendWindowStart: getSendWindowStart(),
  };
}

export const otpConfig = {
  OTP_LENGTH,
  OTP_TTL_MINUTES,
  MAX_SEND_PER_WINDOW,
  SEND_WINDOW_MINUTES,
  MAX_VERIFY_ATTEMPTS,
};
