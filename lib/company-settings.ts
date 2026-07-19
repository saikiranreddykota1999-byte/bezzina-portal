import { company } from '@/config/company';
import type { CompanySettings } from '@/types/cms';

type AddressRecord = {
  line1?: unknown;
  city?: unknown;
  postalCode?: unknown;
  postal_code?: unknown;
  country?: unknown;
};

/** Always returns a plain string — never an address object (safe for JSX). */
export function formatCompanyAddress(address: unknown): string {
  if (typeof address === 'string' && address.trim()) {
    return address.trim();
  }

  if (address && typeof address === 'object' && !Array.isArray(address)) {
    const record = address as AddressRecord;
    const formatted = [
      record.line1,
      record.city,
      record.postalCode ?? record.postal_code,
      record.country,
    ]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(', ');
    if (formatted) return formatted;
  }

  return [
    company.address.line1,
    company.address.city,
    company.address.postalCode,
    company.address.country,
  ].join(', ');
}

export function getDefaultCompanySettings(): CompanySettings {
  return {
    name: company.name,
    tagline: company.tagline,
    email: company.contact.email,
    phone: company.contact.phone1,
    whatsapp: company.contact.whatsapp,
    address: formatCompanyAddress(company.address),
    logoUrl: company.logoUrl,
  };
}

/** Normalize CMS/company payloads so `address` is always a string for rendering. */
export function normalizeCompanySettings(
  value: Partial<CompanySettings> | Record<string, unknown> | null | undefined,
): CompanySettings {
  const defaults = getDefaultCompanySettings();
  const source = value ?? {};

  return {
    name:
      typeof source.name === 'string' && source.name.trim()
        ? source.name.trim()
        : defaults.name,
    tagline:
      typeof source.tagline === 'string' && source.tagline.trim()
        ? source.tagline.trim()
        : defaults.tagline,
    email:
      typeof source.email === 'string' && source.email.trim()
        ? source.email.trim()
        : defaults.email,
    phone:
      typeof source.phone === 'string' && source.phone.trim()
        ? source.phone.trim()
        : defaults.phone,
    whatsapp:
      typeof source.whatsapp === 'string' && source.whatsapp.trim()
        ? source.whatsapp.trim()
        : defaults.whatsapp,
    address: formatCompanyAddress(
      'address' in source ? source.address : defaults.address,
    ),
    logoUrl:
      typeof source.logoUrl === 'string' && source.logoUrl.trim()
        ? source.logoUrl.trim()
        : defaults.logoUrl,
    faviconUrl:
      typeof source.faviconUrl === 'string' && source.faviconUrl.trim()
        ? source.faviconUrl.trim()
        : defaults.faviconUrl,
  };
}
