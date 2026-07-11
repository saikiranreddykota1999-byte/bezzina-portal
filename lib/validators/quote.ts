import { z } from 'zod';

export const submitQuoteCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254),
  phone: z.string().trim().min(8, 'Enter a valid phone number').max(32),
});

export type SubmitQuoteCustomerInput = z.infer<typeof submitQuoteCustomerSchema>;
