'use server';

import type { ActionResult } from '@/types/action';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertCustomerOtpEligible } from '@/lib/auth/otp-eligibility';
import {
  buildOtpForStorage,
  hashOtpCode,
  normalizePhone,
  otpConfig,
  phoneToSyntheticEmail,
} from '@/lib/otp/phone';
import { sendPhoneOtpSchema, verifyPhoneOtpSchema } from '@/lib/validators/phone-otp';
import { isSmsConfigured, sendOtpSms } from '@/services/sms.service';
import { getProfileRole } from '@/lib/auth/get-profile-role';

type AdminClient = ReturnType<typeof createAdminClient>;

async function findUserIdByPhone(admin: AdminClient, phone: string): Promise<string | null> {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  return profile?.id ?? null;
}

async function findUserIdBySyntheticEmail(
  admin: AdminClient,
  syntheticEmail: string,
): Promise<string | null> {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', syntheticEmail)
    .maybeSingle();

  return profile?.id ?? null;
}

async function ensurePhoneUser(
  admin: AdminClient,
  phone: string,
): Promise<{ userId: string; email: string }> {
  const syntheticEmail = phoneToSyntheticEmail(phone);
  const existingId =
    (await findUserIdByPhone(admin, phone)) ??
    (await findUserIdBySyntheticEmail(admin, syntheticEmail));

  if (existingId) {
    const role = await getProfileRole(admin, existingId);
    const eligibility = assertCustomerOtpEligible(role);
    if (!eligibility.ok) {
      throw new Error(eligibility.error);
    }

    const { data: userData } = await admin.auth.admin.getUserById(existingId);
    const email = userData.user?.email ?? syntheticEmail;

    await admin.from('profiles').upsert({
      id: existingId,
      email,
      phone,
      role: role ?? 'customer',
    });

    return { userId: existingId, email };
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { login_method: 'phone_otp' },
  });

  if (error) {
    const fallbackId =
      (await findUserIdByPhone(admin, phone)) ??
      (await findUserIdBySyntheticEmail(admin, syntheticEmail));
    if (!fallbackId) {
      throw new Error(error.message);
    }

    const role = await getProfileRole(admin, fallbackId);
    const eligibility = assertCustomerOtpEligible(role);
    if (!eligibility.ok) {
      throw new Error(eligibility.error);
    }

    const { data: userData } = await admin.auth.admin.getUserById(fallbackId);
    const email = userData.user?.email ?? syntheticEmail;

    await admin.from('profiles').upsert({
      id: fallbackId,
      email,
      phone,
      role: role ?? 'customer',
    });

    return { userId: fallbackId, email };
  }

  if (!created.user) {
    throw new Error('Failed to create account for this phone number');
  }

  await admin.from('profiles').upsert({
    id: created.user.id,
    email: syntheticEmail,
    phone,
    role: 'customer',
  });

  return { userId: created.user.id, email: syntheticEmail };
}

export async function sendPhoneOtpAction(
  input: unknown,
): Promise<ActionResult<{ channel: 'sms' | 'demo'; demoCode?: string }>> {
  try {
    const parsed = sendPhoneOtpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid phone number',
      };
    }

    const phone = normalizePhone(parsed.data.phone);
    if (!phone) {
      return { success: false, error: 'Enter a valid phone number with country code' };
    }

    const { checkPublicRateLimit } = await import('@/lib/auth/login-security');
    const { getClientIp } = await import('@/lib/security/rate-limit');
    const ip = (await getClientIp()) ?? 'unknown';
    const allowed = await checkPublicRateLimit('phone_otp_send', `${ip}:${phone}`, 5, 15);
    if (!allowed) {
      return { success: false, error: 'Too many OTP requests. Please try again later.' };
    }

    const admin = createAdminClient();
    const existingId = await findUserIdByPhone(admin, phone);
    if (existingId) {
      const role = await getProfileRole(admin, existingId);
      const eligibility = assertCustomerOtpEligible(role);
      if (!eligibility.ok) {
        return { success: false, error: eligibility.error };
      }
    }

    const { code, codeHash, expiresAt, sendWindowStart } = buildOtpForStorage(phone);

    const { count } = await admin
      .from('phone_otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .gte('created_at', sendWindowStart.toISOString());

    if ((count ?? 0) >= otpConfig.MAX_SEND_PER_WINDOW) {
      return {
        success: false,
        error: `Too many codes sent. Try again in ${otpConfig.SEND_WINDOW_MINUTES} minutes.`,
      };
    }

    const { error: insertError } = await admin.from('phone_otp_codes').insert({
      phone,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    const delivery = await sendOtpSms(phone, code);

    if (!delivery.sent && process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'SMS is not configured. Please use email login or contact support.',
      };
    }

    const showDemoCode = !delivery.sent && process.env.NODE_ENV !== 'production';

    return {
      success: true,
      data: {
        channel: delivery.channel,
        demoCode: showDemoCode ? code : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

export async function verifyPhoneOtpAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = verifyPhoneOtpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid verification code',
      };
    }

    const phone = normalizePhone(parsed.data.phone);
    if (!phone) {
      return { success: false, error: 'Invalid phone number' };
    }

    const admin = createAdminClient();
    const codeHash = hashOtpCode(phone, parsed.data.code);

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
      return { success: false, error: otpError.message };
    }

    if (!otpRow) {
      return { success: false, error: 'Code expired or not found. Request a new one.' };
    }

    if (otpRow.attempts >= otpConfig.MAX_VERIFY_ATTEMPTS) {
      return { success: false, error: 'Too many attempts. Request a new code.' };
    }

    if (otpRow.code_hash !== codeHash) {
      await admin
        .from('phone_otp_codes')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id);
      return { success: false, error: 'Incorrect code. Try again.' };
    }

    const { userId, email } = await ensurePhoneUser(admin, phone);

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      return { success: false, error: linkError?.message ?? 'Failed to start session' };
    }

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: linkData.properties.hashed_token,
    });

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    await admin
      .from('phone_otp_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpRow.id);

    await admin.from('profiles').update({ phone }).eq('id', userId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

export async function getPhoneOtpStatus() {
  return {
    smsConfigured: isSmsConfigured(),
    demoMode: !isSmsConfigured(),
  };
}
