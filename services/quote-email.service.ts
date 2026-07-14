import { company } from '@/config/company';
import { formatCataloguePrice } from '@/lib/pricing';
import type { QuoteCartItem } from '@/types/quote';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';
const QUOTE_EMAIL_FROM = process.env.OTP_EMAIL_FROM?.trim() ?? 'login@jbezzina.com';

export function isQuoteEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

type QuoteConfirmationInput = {
  reference: string;
  customerName: string;
  customerEmail: string;
  items: QuoteCartItem[];
  notes?: string;
};

export async function sendQuoteConfirmationEmail(
  input: QuoteConfirmationInput,
): Promise<{ sent: boolean; channel: 'email' | 'demo' }> {
  if (!isQuoteEmailConfigured()) {
    return { sent: false, channel: 'demo' };
  }

  const itemLines = input.items.map(
    (item) =>
      `• ${item.name} (${item.sku}) — Qty ${item.quantity} ${item.unit} — ${formatCataloguePrice(item.price) ?? 'Quote on request'}`,
  );

  const subject = `Quote request received — ${input.reference}`;
  const text = [
    `Dear ${input.customerName},`,
    '',
    `Thank you for your quotation request with ${company.name}.`,
    `Reference: ${input.reference}`,
    '',
    'Items requested:',
    ...itemLines,
    input.notes ? `\nNotes: ${input.notes}` : null,
    '',
    'Our team will review your request and respond shortly.',
    '',
    `Contact us: ${company.contact.phone1} | ${company.contact.email}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2>Quote request received</h2>
    <p>Dear ${input.customerName},</p>
    <p>Thank you for your quotation request with <strong>${company.name}</strong>.</p>
    <p><strong>Reference:</strong> ${input.reference}</p>
    <h3>Items requested</h3>
    <ul>${input.items.map((item) => `<li>${item.name} (${item.sku}) — Qty ${item.quantity} ${item.unit}</li>`).join('')}</ul>
    ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ''}
    <p>Our team will review your request and respond shortly.</p>
    <p>${company.contact.phone1} · ${company.contact.email}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: QUOTE_EMAIL_FROM,
      to: input.customerEmail,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Quote confirmation email failed: ${detail.slice(0, 120)}`);
  }

  return { sent: true, channel: 'email' };
}
