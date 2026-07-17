import { describe, expect, it } from 'vitest';
import { submitQuoteCustomerSchema } from './quote';

describe('submitQuoteCustomerSchema', () => {
  it('accepts valid customer details', () => {
    const result = submitQuoteCustomerSchema.safeParse({
      name: 'John Bezzina',
      email: 'john@company.com',
      phone: '+356 7757 6721',
      companyName: 'Bezzina Marine',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty optional company name', () => {
    const result = submitQuoteCustomerSchema.safeParse({
      name: 'John Bezzina',
      email: 'john@company.com',
      phone: '+356 7757 6721',
      companyName: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = submitQuoteCustomerSchema.safeParse({
      name: '',
      email: 'john@company.com',
      phone: '+35677576721',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = submitQuoteCustomerSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      phone: '+35677576721',
    });
    expect(result.success).toBe(false);
  });
});
