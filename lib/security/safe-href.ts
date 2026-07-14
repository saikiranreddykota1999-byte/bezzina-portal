import { z } from 'zod';

const ALLOWED_EXTERNAL_HOSTS = [
  'jbezzina.store',
  'www.jbezzina.store',
  'wa.me',
  'api.whatsapp.com',
  'maps.google.com',
  'www.google.com',
];

export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !trimmed.includes('://') && !trimmed.includes('javascript:');
  }

  if (trimmed.startsWith('#')) return true;

  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return !trimmed.toLowerCase().includes('javascript:');
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_EXTERNAL_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

export const safeHrefSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeHref, 'Invalid or unsafe link URL');

export function sanitizeCmsLinks(content: Record<string, unknown>): Record<string, unknown> {
  const output = { ...content };

  for (const [key, value] of Object.entries(output)) {
    if (typeof value === 'string' && (key.endsWith('Href') || key.endsWith('Url') || key === 'href' || key === 'url' || key === 'ctaHref')) {
      if (value && !isSafeHref(value)) {
        delete output[key];
      }
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = sanitizeCmsLinks(value as Record<string, unknown>);
    }
  }

  return output;
}
