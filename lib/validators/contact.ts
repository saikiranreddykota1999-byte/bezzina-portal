import { z } from 'zod';

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Subject is required').max(160),
  message: z.string().trim().min(10, 'Please provide more detail').max(4000),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;
