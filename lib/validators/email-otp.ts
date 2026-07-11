import { z } from 'zod';
import { otpCodeSchema } from '@/lib/validators/phone-otp';

export const emailInputSchema = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .max(254);

export const sendEmailOtpSchema = z.object({
  email: emailInputSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailInputSchema,
  code: otpCodeSchema,
});
