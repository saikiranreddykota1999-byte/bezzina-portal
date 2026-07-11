import { otpConfig } from '@/lib/otp/core';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';
const OTP_EMAIL_FROM = process.env.OTP_EMAIL_FROM?.trim() ?? 'login@jbezzina.com';

export function isEmailOtpConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendOtpEmail(
  email: string,
  code: string,
): Promise<{ sent: boolean; channel: 'email' | 'demo' }> {
  if (!isEmailOtpConfigured()) {
    return { sent: false, channel: 'demo' };
  }

  const subject = 'Your Bezzina login code';
  const text = [
    'Use this code to sign in or create your Bezzina account:',
    '',
    code,
    '',
    `This code expires in ${otpConfig.OTP_TTL_MINUTES} minutes.`,
    'If you did not request this, you can ignore this email.',
  ].join('\n');

  const html = `
    <p>Use this code to sign in or create your Bezzina account:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">${code}</p>
    <p>This code expires in ${otpConfig.OTP_TTL_MINUTES} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: OTP_EMAIL_FROM,
      to: email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email delivery failed: ${detail.slice(0, 120)}`);
  }

  return { sent: true, channel: 'email' };
}
