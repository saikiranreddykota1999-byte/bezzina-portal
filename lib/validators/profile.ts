import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120),
  phone: z.string().trim().min(8, 'Enter a valid phone number').max(32),
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
