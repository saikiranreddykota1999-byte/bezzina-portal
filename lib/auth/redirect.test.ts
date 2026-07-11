import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';

describe('sanitizeRedirectPath', () => {
  it('returns the fallback for empty values', () => {
    expect(sanitizeRedirectPath(null)).toBe('/account');
    expect(sanitizeRedirectPath(undefined)).toBe('/account');
    expect(sanitizeRedirectPath('')).toBe('/account');
  });

  it('allows same-origin relative paths', () => {
    expect(sanitizeRedirectPath('/account/profile')).toBe('/account/profile');
    expect(sanitizeRedirectPath(' /admin/orders ')).toBe('/admin/orders');
  });

  it('blocks open redirects and external URLs', () => {
    expect(sanitizeRedirectPath('//evil.example.com')).toBe('/account');
    expect(sanitizeRedirectPath('https://evil.example.com')).toBe('/account');
    expect(sanitizeRedirectPath('/\\evil.example.com')).toBe('/account');
    expect(sanitizeRedirectPath('/account@evil.example.com')).toBe('/account');
  });

  it('supports a custom fallback', () => {
    expect(sanitizeRedirectPath(null, '/account/login')).toBe('/account/login');
  });
});
