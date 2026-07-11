import { company } from '@/config/company';

/** WhatsApp number for wa.me links (no + or spaces). Confirm with client — see docs/CLIENT-CONFIRMATIONS.md */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || '35621226647';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildProductQuoteMessage(product: {
  name: string;
  sku: string;
  slug: string;
}): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : company.contact.website;
  return [
    `Hello ${company.shortName}, I would like a quote for:`,
    '',
    `Product: ${product.name}`,
    `SKU: ${product.sku}`,
    `Link: ${origin}/products/${product.slug}`,
  ].join('\n');
}

export function buildMultiQuoteMessage(
  items: { name: string; sku: string; quantity: number }[],
): string {
  const lines = items.map(
    (item, i) => `${i + 1}. ${item.name} (${item.sku}) × ${item.quantity}`,
  );
  return [
    `Hello ${company.shortName}, I would like a quote for the following items:`,
    '',
    ...lines,
    '',
    'Please advise on pricing and availability.',
  ].join('\n');
}
