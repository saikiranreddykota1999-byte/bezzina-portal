'use server';

import type { ActionResult } from '@/types/action';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertCustomerOtpEligible } from '@/lib/auth/otp-eligibility';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { normalizePhone, phoneToSyntheticEmail } from '@/lib/otp/phone';
import {
  consumePhoneOtpCode,
  markPhoneOtpVerified,
  phoneOtpDeliveryStatus,
  sendPhoneOtpCode,
} from '@/lib/otp/phone-otp-verify';
import { sendPhoneOtpSchema, verifyPhoneOtpSchema } from '@/lib/validators/phone-otp';
import { getProfileRole } from '@/lib/auth/get-profile-role';
import { revalidatePath } from 'next/cache';

type AdminClient = ReturnType<typeof createAdminClient>;

/** Lookup by normalized phone. Unique index makes >1 rows impossible; 0 rows → null. */
async function findUserIdByPhone(
  admin: AdminClient,
  phone: string,
): Promise<string | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return null;
  }

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', normalized)
    .single();

  if (error) {
    // PostgREST: no rows
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function findUserIdBySyntheticEmail(
  admin: AdminClient,
  syntheticEmail: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('email', syntheticEmail)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
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

    const delivery = await sendPhoneOtpCode(admin, phone);
    if (!delivery.ok) {
      return { success: false, error: delivery.error };
    }

    return {
      success: true,
      data: {
        channel: delivery.channel,
        demoCode: delivery.demoCode,
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
    const consumed = await consumePhoneOtpCode(admin, phone, parsed.data.code);
    if (!consumed.ok) {
      return { success: false, error: consumed.error };
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

    await markPhoneOtpVerified(admin, consumed.otpRowId);
    await admin.from('profiles').update({ phone }).eq('id', userId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

/**
 * Send OTP to a phone before it can be bound to the authenticated profile.
 * Does not update profiles.phone.
 */
export async function requestPhoneVerification(
  phoneInput: string,
): Promise<ActionResult<{ channel: 'sms' | 'demo'; demoCode?: string }>> {
  try {
    const parsed = sendPhoneOtpSchema.safeParse({ phone: phoneInput });
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

    const { user } = await requireAuthenticatedUser();
    const admin = createAdminClient();

    const { checkPublicRateLimit } = await import('@/lib/auth/login-security');
    const { getClientIp } = await import('@/lib/security/rate-limit');
    const ip = (await getClientIp()) ?? 'unknown';
    const allowed = await checkPublicRateLimit(
      'phone_verify_send',
      `${user!.id}:${ip}:${phone}`,
      5,
      15,
    );
    if (!allowed) {
      return { success: false, error: 'Too many OTP requests. Please try again later.' };
    }

    const ownerId = await findUserIdByPhone(admin, phone);
    if (ownerId && ownerId !== user!.id) {
      return {
        success: false,
        error: 'This phone number is already linked to another account.',
      };
    }

    const delivery = await sendPhoneOtpCode(admin, phone);
    if (!delivery.ok) {
      return { success: false, error: delivery.error };
    }

    return {
      success: true,
      data: {
        channel: delivery.channel,
        demoCode: delivery.demoCode,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification code',
    };
  }
}

/**
 * Verify OTP and bind phone to the current authenticated user only.
 */
export async function verifyPhoneAndBind(
  phoneInput: string,
  code: string,
): Promise<ActionResult> {
  try {
    const parsed = verifyPhoneOtpSchema.safeParse({ phone: phoneInput, code });
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

    const { supabase, user } = await requireAuthenticatedUser();
    const admin = createAdminClient();

    const consumed = await consumePhoneOtpCode(admin, phone, parsed.data.code);
    if (!consumed.ok) {
      return { success: false, error: consumed.error };
    }

    const ownerId = await findUserIdByPhone(admin, phone);
    if (ownerId && ownerId !== user!.id) {
      return {
        success: false,
        error: 'This phone number is already linked to another account.',
      };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', user!.id);

    if (profileError) {
      if (profileError.code === '23505') {
        return {
          success: false,
          error: 'This phone number is already linked to another account.',
        };
      }
      return { success: false, error: profileError.message };
    }

    await supabase.auth.updateUser({
      data: { phone },
    });

    await markPhoneOtpVerified(admin, consumed.otpRowId);
    revalidatePath('/account/profile');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify phone',
    };
  }
}

export async function getPhoneOtpStatus() {
  return phoneOtpDeliveryStatus();
}
