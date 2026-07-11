import {
  generateOtpCode,
  getOtpExpiryDate,
  getSendWindowStart,
  hashOtpCode,
  normalizePhone,
  otpConfig,
} from '@/lib/otp/phone';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID?.trim() ?? '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim() ?? '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER?.trim() ?? '';

export function isSmsConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

export async function sendOtpSms(
  phone: string,
  code: string,
): Promise<{ sent: boolean; channel: 'sms' | 'demo' }> {
  if (!isSmsConfigured()) {
    return { sent: false, channel: 'demo' };
  }

  const body = `Your Bezzina login code is ${code}. Valid for ${otpConfig.OTP_TTL_MINUTES} minutes.`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SMS delivery failed: ${detail.slice(0, 120)}`);
  }

  return { sent: true, channel: 'sms' };
}

export function buildOtpForStorage(phone: string) {
  const code = generateOtpCode();
  return {
    code,
    codeHash: hashOtpCode(phone, code),
    expiresAt: getOtpExpiryDate(),
    sendWindowStart: getSendWindowStart(),
  };
}
