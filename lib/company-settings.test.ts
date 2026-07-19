import { describe, expect, it } from 'vitest';
import {
  formatCompanyAddress,
  getDefaultCompanySettings,
  normalizeCompanySettings,
} from '@/lib/company-settings';

describe('formatCompanyAddress', () => {
  it('returns trimmed strings as-is', () => {
    expect(formatCompanyAddress('  Marsa, Malta  ')).toBe('Marsa, Malta');
  });

  it('formats address objects used by config/CMS', () => {
    expect(
      formatCompanyAddress({
        line1: '5/6 Triq Aldo Moro',
        city: 'Il-Marsa',
        postalCode: 'MRS 9065',
        country: 'Malta',
      }),
    ).toBe('5/6 Triq Aldo Moro, Il-Marsa, MRS 9065, Malta');
  });

  it('falls back to company defaults for invalid values', () => {
    expect(formatCompanyAddress(null)).toContain('Il-Marsa');
    expect(formatCompanyAddress(42)).toContain('Malta');
  });
});

describe('normalizeCompanySettings', () => {
  it('never leaves address as an object', () => {
    const normalized = normalizeCompanySettings({
      name: 'Test Co',
      address: {
        line1: 'Line 1',
        city: 'City',
        postalCode: 'PST',
        country: 'Malta',
      },
    });

    expect(typeof normalized.address).toBe('string');
    expect(normalized.address).toBe('Line 1, City, PST, Malta');
    expect(normalized.name).toBe('Test Co');
  });

  it('fills defaults for missing fields', () => {
    const defaults = getDefaultCompanySettings();
    const normalized = normalizeCompanySettings({});
    expect(normalized.email).toBe(defaults.email);
    expect(typeof normalized.address).toBe('string');
  });
});
