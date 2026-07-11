import { describe, expect, it } from 'vitest';
import { normalizeEmail } from '@/lib/otp/email';

describe('normalizeEmail', () => {
  it('normalizes valid emails', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('rejects synthetic phone-login emails', () => {
    expect(normalizeEmail('35677576721@phone.otp.bezzina')).toBeNull();
  });

  it('rejects invalid emails', () => {
    expect(normalizeEmail('not-an-email')).toBeNull();
  });
});
