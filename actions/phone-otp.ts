'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  hashOtpCode,
  normalizePhone,
  otpConfig,
  phoneToSyntheticEmail,
} from '@/lib/otp/phone';
import { sendPhoneOtpSchema, verifyPhoneOtpSchema } from '@/lib/validators/phone-otp';
import { buildOtpForStorage, isSmsConfigured, sendOtpSms } from '@/services/sms.service';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

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

    const admin = createAdminClient();
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

async function findUserIdByPhone(admin: ReturnType<typeof createAdminClient>, phone: string) {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  return profile?.id ?? null;
}

async function ensurePhoneUser(admin: ReturnType<typeof createAdminClient>, phone: string) {
  const syntheticEmail = phoneToSyntheticEmail(phone);
  const existingId = await findUserIdByPhone(admin, phone);

  if (existingId) {
    const { data: userData } = await admin.auth.admin.getUserById(existingId);
    if (userData.user) {
      return { userId: existingId, email: userData.user.email ?? syntheticEmail };
    }
  }

  const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingUser = listData.users.find(
    (user) => user.email === syntheticEmail || user.phone === phone,
  );

  if (existingUser) {
    await admin.from('profiles').upsert({
      id: existingUser.id,
      email: existingUser.email ?? syntheticEmail,
      phone,
      role: 'customer',
    });
    return { userId: existingUser.id, email: existingUser.email ?? syntheticEmail };
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { login_method: 'phone_otp' },
  });

  if (error) {
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const fallback = listData.users.find(
      (user) => user.email === syntheticEmail || user.phone === phone,
    );
    if (!fallback) {
      throw new Error(error.message);
    }
    await admin.from('profiles').upsert({
      id: fallback.id,
      email: fallback.email ?? syntheticEmail,
      phone,
      role: 'customer',
    });
    return { userId: fallback.id, email: fallback.email ?? syntheticEmail };
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

export async function verifyPhoneOtpAction(
  input: unknown,
): Promise<ActionResult> {
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

    const { email } = await ensurePhoneUser(admin, phone);

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

    await admin.from('profiles').update({ phone }).eq('email', email);

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
