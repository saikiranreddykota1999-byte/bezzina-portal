import { z } from 'zod';

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export const enterprisePasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(SPECIAL_CHARS, 'Password must include a special character');

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function scorePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';

  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (SPECIAL_CHARS.test(password)) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
}

export function passwordMeetsPolicy(password: string): boolean {
  return enterprisePasswordSchema.safeParse(password).success;
}
