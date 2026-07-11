import { describe, expect, it } from 'vitest';
import { generatePickupCode, normalizeTimeValue } from '@/lib/pickup/code';

describe('pickup code helpers', () => {
  it('generates pickup codes in expected format', () => {
    expect(generatePickupCode()).toMatch(/^PKP-[A-Z0-9]{6}$/);
  });

  it('normalizes HH:MM times to HH:MM:SS', () => {
    expect(normalizeTimeValue('10:00')).toBe('10:00:00');
    expect(normalizeTimeValue('10:00:00')).toBe('10:00:00');
  });
});
