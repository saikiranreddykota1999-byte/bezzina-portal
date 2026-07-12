import { company } from '@/config/company';
import type { ContactEnquiryInput } from '@/lib/validators/contact';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';
const CONTACT_EMAIL_FROM = process.env.OTP_EMAIL_FROM?.trim() ?? 'login@jbezzina.com';
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO?.trim() ?? company.contact.email;

export function isContactEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendContactEnquiryEmail(
  enquiry: ContactEnquiryInput,
): Promise<{ sent: boolean; channel: 'email' | 'demo' }> {
  if (!isContactEmailConfigured()) {
    return { sent: false, channel: 'demo' };
  }

  const subject = `[Website Enquiry] ${enquiry.subject}`;
  const text = [
    `New contact enquiry from ${enquiry.name}`,
    '',
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : null,
    enquiry.company ? `Company: ${enquiry.company}` : null,
    '',
    enquiry.message,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2>New contact enquiry</h2>
    <p><strong>Name:</strong> ${enquiry.name}</p>
    <p><strong>Email:</strong> ${enquiry.email}</p>
    ${enquiry.phone ? `<p><strong>Phone:</strong> ${enquiry.phone}</p>` : ''}
    ${enquiry.company ? `<p><strong>Company:</strong> ${enquiry.company}</p>` : ''}
    <p><strong>Subject:</strong> ${enquiry.subject}</p>
    <p>${enquiry.message.replace(/\n/g, '<br />')}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_EMAIL_FROM,
      to: CONTACT_EMAIL_TO,
      reply_to: enquiry.email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Contact email failed: ${detail.slice(0, 120)}`);
  }

  return { sent: true, channel: 'email' };
}
