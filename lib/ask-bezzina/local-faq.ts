import { company } from '@/config/company';
import type { AskBezzinaIdentifyResult } from '@/lib/ask-bezzina/types';

const BUSINESS_HOURS = `Monday – Friday: 7:00 AM – 4:00 PM
Saturday: Closed
Sunday: Closed`;

const HOURS_PATTERN =
  /\b(hour|hours|timing|timings|open|opening|close|closing|when\s+are\s+you|business\s+hours|schedule|limints|limits)\b/i;
const CONTACT_PATTERN =
  /\b(contact|phone|call|email|e-mail|whatsapp|whats\s*app|reach\s+you|telephone)\b/i;
const ADDRESS_PATTERN =
  /\b(address|location|where\s+are\s+you|map|directions|find\s+you|marsa)\b/i;

/**
 * Answer common company questions without calling Gemini (resilient when the
 * model is unavailable / rate-limited).
 */
export function tryLocalFaqReply(message: string): AskBezzinaIdentifyResult | null {
  const text = message.trim();
  if (!text) return null;

  if (HOURS_PATTERN.test(text)) {
    return {
      summary: `Our business hours are:\n${BUSINESS_HOURS}`,
      searchQueries: [],
      confidence: 'high',
    };
  }

  if (ADDRESS_PATTERN.test(text)) {
    const address = [
      company.address.line1,
      company.address.city,
      company.address.postalCode,
      company.address.country,
    ].join(', ');
    return {
      summary: `We are at ${address}.\nMap: ${company.maps.shortUrl}`,
      searchQueries: [],
      confidence: 'high',
    };
  }

  if (CONTACT_PATTERN.test(text)) {
    return {
      summary: [
        `Phone: ${company.contact.phone1} / ${company.contact.phone2}`,
        `Email: ${company.contact.email}`,
        `WhatsApp: ${company.contact.whatsapp}`,
      ].join('\n'),
      searchQueries: [],
      confidence: 'high',
    };
  }

  return null;
}
