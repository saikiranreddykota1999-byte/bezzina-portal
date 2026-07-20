import { z } from 'zod';
import { turnstileTokenSchema } from '@/lib/validators/turnstile';

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  turnstileToken: turnstileTokenSchema,
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
