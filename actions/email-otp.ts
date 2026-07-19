'use server';

import type { ActionResult } from '@/types/action';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  findAuthUserIdByEmail,
  getAuthUserEmailById,
} from '@/lib/auth/find-auth-user';
import { assertCustomerOtpEligible } from '@/lib/auth/otp-eligibility';
import { normalizeEmail } from '@/lib/otp/email';
import { buildOtpForStorage, hashOtpCode, otpConfig } from '@/lib/otp/core';
import {
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
} from '@/lib/validators/email-otp';
import { isEmailOtpConfigured, sendOtpEmail } from '@/services/otp-email.service';
import { getProfileRole } from '@/lib/auth/get-profile-role';

type AdminClient = ReturnType<typeof createAdminClient>;

async function ensureEmailUser(
  admin: AdminClient,
  email: string,
): Promise<{ userId: string; email: string }> {
  const existingId = await findAuthUserIdByEmail(admin, email);

  if (existingId) {
    const role = await getProfileRole(admin, existingId);
    const eligibility = assertCustomerOtpEligible(role);
    if (!eligibility.ok) {
      throw new Error(eligibility.error);
    }

    const authEmail = (await getAuthUserEmailById(admin, existingId)) ?? email;
    await admin.from('profiles').upsert({
      id: existingId,
      email,
      contact_email: email,
      role: role ?? 'customer',
    });
    return { userId: existingId, email: authEmail };
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { login_method: 'email_otp' },
  });

  if (error) {
    const fallbackId = await findAuthUserIdByEmail(admin, email);
    if (!fallbackId) {
      throw new Error(error.message);
    }

    const role = await getProfileRole(admin, fallbackId);
    const eligibility = assertCustomerOtpEligible(role);
    if (!eligibility.ok) {
      throw new Error(eligibility.error);
    }

    const authEmail = (await getAuthUserEmailById(admin, fallbackId)) ?? email;
    await admin.from('profiles').upsert({
      id: fallbackId,
      email,
      contact_email: email,
      role: role ?? 'customer',
    });
    return { userId: fallbackId, email: authEmail };
  }

  if (!created.user) {
    throw new Error('Failed to create account for this email');
  }

  await admin.from('profiles').upsert({
    id: created.user.id,
    email,
    contact_email: email,
    role: 'customer',
  });

  return { userId: created.user.id, email };
}

export async function sendEmailOtpAction(
  input: unknown,
): Promise<ActionResult<{ channel: 'email' | 'demo'; demoCode?: string }>> {
  try {
    const parsed = sendEmailOtpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid email address',
      };
    }

    const email = normalizeEmail(parsed.data.email);
    if (!email) {
      return { success: false, error: 'Enter a valid email address' };
    }

    const { checkPublicRateLimit } = await import('@/lib/auth/login-security');
    const { getClientIp } = await import('@/lib/security/rate-limit');
    const ip = (await getClientIp()) ?? 'unknown';
    const allowed = await checkPublicRateLimit('email_otp_send', `${ip}:${email}`, 5, 15);
    if (!allowed) {
      return { success: false, error: 'Too many OTP requests. Please try again later.' };
    }

    const admin = createAdminClient();
    const existingId = await findAuthUserIdByEmail(admin, email);
    if (existingId) {
      const role = await getProfileRole(admin, existingId);
      const eligibility = assertCustomerOtpEligible(role);
      if (!eligibility.ok) {
        return { success: false, error: eligibility.error };
      }
    }

    const { code, codeHash, expiresAt, sendWindowStart } = buildOtpForStorage(email);

    const { count } = await admin
      .from('email_otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', sendWindowStart.toISOString());

    if ((count ?? 0) >= otpConfig.MAX_SEND_PER_WINDOW) {
      return {
        success: false,
        error: `Too many codes sent. Try again in ${otpConfig.SEND_WINDOW_MINUTES} minutes.`,
      };
    }

    const { error: insertError } = await admin.from('email_otp_codes').insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    const delivery = await sendOtpEmail(email, code);

    if (!delivery.sent && process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Email delivery is not configured. Please use phone OTP or contact support.',
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
    const { logServerError, toUserError } = await import('@/lib/security/sanitize-error');
    logServerError('sendEmailOtpAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function verifyEmailOtpAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = verifyEmailOtpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid verification code',
      };
    }

    const email = normalizeEmail(parsed.data.email);
    if (!email) {
      return { success: false, error: 'Invalid email address' };
    }

    const admin = createAdminClient();
    const codeHash = hashOtpCode(email, parsed.data.code);

    const { data: otpRow, error: otpError } = await admin
      .from('email_otp_codes')
      .select('*')
      .eq('email', email)
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
        .from('email_otp_codes')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id);
      return { success: false, error: 'Incorrect code. Try again.' };
    }

    const { userId, email: sessionEmail } = await ensureEmailUser(admin, email);

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: sessionEmail,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      const { logServerError, toUserError } = await import('@/lib/security/sanitize-error');
      logServerError('verifyEmailOtpAction.link', linkError);
      return { success: false, error: toUserError(linkError) };
    }

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: linkData.properties.hashed_token,
    });

    if (sessionError) {
      const { logServerError, toUserError } = await import('@/lib/security/sanitize-error');
      logServerError('verifyEmailOtpAction.session', sessionError);
      return { success: false, error: toUserError(sessionError, 'auth') };
    }

    await admin
      .from('email_otp_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpRow.id);

    await admin.from('profiles').update({ contact_email: email, email }).eq('id', userId);

    return { success: true };
  } catch (error) {
    const { logServerError, toUserError } = await import('@/lib/security/sanitize-error');
    logServerError('verifyEmailOtpAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function getEmailOtpStatus() {
  return {
    emailConfigured: isEmailOtpConfigured(),
    demoMode: !isEmailOtpConfigured(),
  };
}
