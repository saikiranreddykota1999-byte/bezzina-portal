'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isStaffRole } from '@/lib/auth/roles';
import { MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES } from '@/lib/supabase/middleware';

type LoginResult =
  | { success: true }
  | { success: false; error: string; locked?: boolean };

async function checkLockout(email: string): Promise<boolean> {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc('count_failed_login_attempts', {
    p_email: email.toLowerCase(),
    p_since: since,
  });

  if (error) {
    console.error('checkLockout error:', error.message);
    return false;
  }

  return (data ?? 0) >= MAX_FAILED_ATTEMPTS;
}

async function recordAttempt(email: string, success: boolean) {
  const supabase = await createClient();
  await supabase.from('login_attempts').insert({
    email: email.toLowerCase(),
    success,
  });
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<LoginResult> {
  const normalizedEmail = email.toLowerCase().trim();

  if (await checkLockout(normalizedEmail)) {
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
      locked: true,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    await recordAttempt(normalizedEmail, false);
    return { success: false, error: error?.message ?? 'Login failed' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!isStaffRole(profile?.role)) {
    await supabase.auth.signOut();
    await recordAttempt(normalizedEmail, false);
    return { success: false, error: 'Access restricted to admin users.' };
  }

  await recordAttempt(normalizedEmail, true);
  return { success: true };
}

export async function customerOAuthLogin(provider: 'google' | 'facebook') {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) return { success: false as const, error: error.message };
  if (data.url) {
    const cookieStore = await cookies();
    cookieStore.set('oauth_redirect', '/account', { httpOnly: true, maxAge: 300 });
  }
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
