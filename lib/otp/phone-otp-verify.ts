import {
  buildOtpForStorage,
  hashOtpCode,
  otpConfig,
} from '@/lib/otp/phone';
import type { createAdminClient } from '@/lib/supabase/admin';
import { isSmsConfigured, sendOtpSms } from '@/services/sms.service';

type AdminClient = ReturnType<typeof createAdminClient>;

export type SendPhoneOtpResult =
  | { ok: true; channel: 'sms' | 'demo'; demoCode?: string }
  | { ok: false; error: string };

export type ConsumePhoneOtpResult =
  | { ok: true; otpRowId: string }
  | { ok: false; error: string };

/** Insert OTP row and deliver SMS (shared by login + profile bind flows). */
export async function sendPhoneOtpCode(
  admin: AdminClient,
  phone: string,
): Promise<SendPhoneOtpResult> {
  const { code, codeHash, expiresAt, sendWindowStart } = buildOtpForStorage(phone);

  const { count } = await admin
    .from('phone_otp_codes')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', sendWindowStart.toISOString());

  if ((count ?? 0) >= otpConfig.MAX_SEND_PER_WINDOW) {
    return {
      ok: false,
      error: `Too many codes sent. Try again in ${otpConfig.SEND_WINDOW_MINUTES} minutes.`,
    };
  }

  const { error: insertError } = await admin.from('phone_otp_codes').insert({
    phone,
    code_hash: codeHash,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const delivery = await sendOtpSms(phone, code);

  if (!delivery.sent && process.env.NODE_ENV === 'production') {
    return {
      ok: false,
      error: 'SMS is not configured. Please use email login or contact support.',
    };
  }

  const showDemoCode = !delivery.sent && process.env.NODE_ENV !== 'production';

  return {
    ok: true,
    channel: delivery.channel,
    demoCode: showDemoCode ? code : undefined,
  };
}

/** Validate OTP and mark attempts; caller marks verified_at after successful side effects. */
export async function consumePhoneOtpCode(
  admin: AdminClient,
  phone: string,
  code: string,
): Promise<ConsumePhoneOtpResult> {
  const codeHash = hashOtpCode(phone, code);

  const { data: otpRow, error: otpError } = await admin
    .from('phone_otp_codes')
    .select('*')
    .eq('phone', phone)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    return { ok: false, error: otpError.message };
  }

  if (!otpRow) {
    return { ok: false, error: 'Code expired or not found. Request a new one.' };
  }

  if (otpRow.attempts >= otpConfig.MAX_VERIFY_ATTEMPTS) {
    return { ok: false, error: 'Too many attempts. Request a new code.' };
  }

  if (otpRow.code_hash !== codeHash) {
    await admin
      .from('phone_otp_codes')
      .update({ attempts: otpRow.attempts + 1 })
      .eq('id', otpRow.id);
    return { ok: false, error: 'Incorrect code. Try again.' };
  }

  return { ok: true, otpRowId: otpRow.id };
}

export async function markPhoneOtpVerified(
  admin: AdminClient,
  otpRowId: string,
): Promise<void> {
  await admin
    .from('phone_otp_codes')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', otpRowId);
}

export function phoneOtpDeliveryStatus() {
  return {
    smsConfigured: isSmsConfigured(),
    demoMode: !isSmsConfigured(),
  };
}
