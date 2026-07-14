'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPortalRole, isSuperAdminRole } from '@/lib/auth/roles';
import {
  checkLoginLockout,
  recordLoginAttempt,
  toAuthError,
} from '@/lib/auth/login-security';
import {
  getSuperAdminMfaStatus,
  isSuperAdminMfaRequired,
} from '@/lib/auth/super-admin-mfa';
import { logActivity } from '@/services/activity-log.service';
import { loginSchema, forgotPasswordSchema } from '@/lib/validators/auth';
import { logServerError } from '@/lib/security/sanitize-error';

type LoginResult =
  | {
      success: true;
      requiresPasswordChange?: boolean;
      requiresMfaSetup?: boolean;
      requiresMfaVerify?: boolean;
    }
  | { success: false; error: string; locked?: boolean };

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: toAuthError() };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  const lockout = await checkLoginLockout(normalizedEmail);
  if (lockout) return lockout;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await recordLoginAttempt(normalizedEmail, false);
    await logActivity({
      userId: null,
      action: 'login_failed',
      entity: 'auth',
      metadata: { email: normalizedEmail, portal: 'admin' },
    });
    return { success: false, error: toAuthError() };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_disabled, force_password_change')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.is_disabled) {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    return { success: false, error: 'Your account has been disabled.' };
  }

  if (!isPortalRole(profile?.role)) {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    return { success: false, error: toAuthError() };
  }

  await recordLoginAttempt(normalizedEmail, true);
  await logActivity({
    userId: data.user.id,
    action: 'login_success',
    entity: 'auth',
    metadata: { portal: 'admin' },
  });

  if (profile?.force_password_change === true) {
    return { success: true, requiresPasswordChange: true };
  }

  if (isSuperAdminRole(profile?.role) && isSuperAdminMfaRequired()) {
    const mfaStatus = await getSuperAdminMfaStatus(supabase);
    if (!mfaStatus.enrolled) {
      return { success: true, requiresMfaSetup: true };
    }
    if (!mfaStatus.verified) {
      return { success: true, requiresMfaVerify: true };
    }
  }

  return { success: true };
}

export async function customerPasswordLogin(
  email: string,
  password: string,
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: toAuthError() };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  const lockout = await checkLoginLockout(normalizedEmail);
  if (lockout) return lockout;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await recordLoginAttempt(normalizedEmail, false);
    await logActivity({
      userId: null,
      action: 'login_failed',
      entity: 'auth',
      metadata: { email: normalizedEmail, portal: 'customer' },
    });
    return { success: false, error: toAuthError() };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_disabled')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.is_disabled) {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    return { success: false, error: 'Your account has been disabled.' };
  }

  await recordLoginAttempt(normalizedEmail, true);
  await logActivity({
    userId: data.user.id,
    action: 'login_success',
    entity: 'auth',
    metadata: { portal: 'customer' },
  });
  return { success: true };
}

export async function requestPasswordReset(email: string): Promise<LoginResult> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: 'Enter a valid email address.' };
  }

  const ip = (await getClientIp()) ?? 'unknown';
  const supabase = await createClient();
  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    p_action: 'password_reset',
    p_identifier: `${ip}:${parsed.data.email}`,
    p_max_attempts: 3,
    p_window_minutes: 60,
  });

  if (!allowed) {
    return { success: false, error: 'Too many requests. Please try again later.' };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/account/reset-password`,
  });

  if (error) {
    logServerError('requestPasswordReset', error);
  }

  return {
    success: true,
  };
}

export async function signOutAllDevices(userId: string): Promise<LoginResult> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.signOut(userId, 'global');
    if (error) return { success: false, error: 'Failed to revoke sessions.' };
    return { success: true };
  } catch (error) {
    logServerError('signOutAllDevices', error);
    return { success: false, error: 'Failed to revoke sessions.' };
  }
}

export async function customerOAuthLogin(provider: 'google' | 'facebook') {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=/account`,
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, url: data.url };
}

import { sendPhoneOtpAction, verifyPhoneOtpAction } from '@/actions/phone-otp';
import { sendEmailOtpAction, verifyEmailOtpAction } from '@/actions/email-otp';

export async function sendPhoneOtp(phone: string) {
  return sendPhoneOtpAction({ phone });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  return verifyPhoneOtpAction({ phone, code: token });
}

export async function sendEmailOtp(email: string) {
  return sendEmailOtpAction({ email });
}

export async function verifyEmailOtp(email: string, token: string) {
  return verifyEmailOtpAction({ email, code: token });
}
