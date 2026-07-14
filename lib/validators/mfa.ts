import { z } from 'zod';

export const mfaCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app');

export const mfaFactorIdSchema = z.string().uuid('Invalid MFA factor');
