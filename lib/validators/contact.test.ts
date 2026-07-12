import { describe, expect, it } from 'vitest';
import { contactEnquirySchema } from '@/lib/validators/contact';

describe('contactEnquirySchema', () => {
  it('accepts valid enquiry', () => {
    const result = contactEnquirySchema.safeParse({
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+356 2122 6647',
      company: 'Marine Works Ltd',
      subject: 'Product enquiry',
      message: 'We need a quotation for marine fasteners.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short message', () => {
    const result = contactEnquirySchema.safeParse({
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Hi',
      message: 'Short',
    });
    expect(result.success).toBe(false);
  });
});
