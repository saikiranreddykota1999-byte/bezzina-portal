import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
