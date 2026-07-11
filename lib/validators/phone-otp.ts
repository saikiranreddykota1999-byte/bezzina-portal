import { z } from 'zod';

export const phoneInputSchema = z
  .string()
  .trim()
  .min(8, 'Enter a valid phone number')
  .max(20, 'Phone number is too long');

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

export const sendPhoneOtpSchema = z.object({
  phone: phoneInputSchema,
});

export const verifyPhoneOtpSchema = z.object({
  phone: phoneInputSchema,
  code: otpCodeSchema,
});
