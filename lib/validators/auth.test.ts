import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '@/lib/validators/auth';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email and empty password', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'SecurePass1!',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short names and weak passwords', () => {
    const result = registerSchema.safeParse({
      fullName: 'J',
      email: 'jane@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });
});
