import { z } from 'zod';

/** Profile fields that may be updated without OTP. Phone requires verifyPhoneAndBind. */
export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120),
  contactEmail: z
    .string()
    .trim()
    .max(254)
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email address',
    }),
  billingAddress: z.string().trim().max(500),
  vatNumber: z.string().trim().max(32),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
