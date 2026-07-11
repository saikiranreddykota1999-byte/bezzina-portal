import { describe, expect, it } from 'vitest';
import { isActivePath } from '@/lib/navigation';

describe('isActivePath', () => {
  it('matches the home route exactly', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/about', '/')).toBe(false);
  });

  it('matches exact and nested paths', () => {
    expect(isActivePath('/products', '/products')).toBe(true);
    expect(isActivePath('/products/bolts', '/products')).toBe(true);
    expect(isActivePath('/products-old', '/products')).toBe(false);
  });
});
