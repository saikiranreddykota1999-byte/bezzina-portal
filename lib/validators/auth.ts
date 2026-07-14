import { z } from 'zod';
import { enterprisePasswordSchema } from '@/lib/auth/password-policy';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254),
  password: enterprisePasswordSchema,
});

export const changePasswordSchema = z.object({
  password: enterprisePasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(254),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
