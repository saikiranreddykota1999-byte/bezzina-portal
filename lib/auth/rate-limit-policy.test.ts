import { describe, expect, it } from 'vitest';
import { isPublicRateLimitAllowed } from '@/lib/auth/rate-limit-policy';

describe('isPublicRateLimitAllowed', () => {
  it('fails closed when the RPC errors', () => {
    expect(isPublicRateLimitAllowed({ message: 'db down' }, true)).toBe(false);
    expect(isPublicRateLimitAllowed({ message: 'db down' }, null)).toBe(false);
  });

  it('allows only explicit true when no error', () => {
    expect(isPublicRateLimitAllowed(null, true)).toBe(true);
    expect(isPublicRateLimitAllowed(null, false)).toBe(false);
    expect(isPublicRateLimitAllowed(null, null)).toBe(false);
    expect(isPublicRateLimitAllowed(undefined, undefined)).toBe(false);
  });
});
