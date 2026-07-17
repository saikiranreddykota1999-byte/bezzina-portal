'use server';

import { createClient } from '@/lib/supabase/server';
import { SECURITY_CONFIG } from '@/config/security';
import { isPublicRateLimitAllowed } from '@/lib/auth/rate-limit-policy';
import { toAuthError, logServerError } from '@/lib/security/sanitize-error';

export type LoginResult =
  | { success: true }
  | { success: false; error: string; locked?: boolean };

export async function checkLoginLockout(email: string): Promise<LoginResult | null> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - SECURITY_CONFIG.lockoutMinutes * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase.rpc('count_failed_login_attempts', {
    p_email: email.toLowerCase(),
    p_since: since,
  });

  if (error) {
    logServerError('checkLoginLockout', error);
    return {
      success: false,
      error: 'Login is temporarily unavailable. Please try again shortly.',
    };
  }

  if ((data ?? 0) >= SECURITY_CONFIG.maxFailedLoginAttempts) {
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${SECURITY_CONFIG.lockoutMinutes} minutes.`,
      locked: true,
    };
  }

  return null;
}

export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('record_login_attempt', {
    p_email: email.toLowerCase(),
    p_success: success,
  });

  if (error) {
    logServerError('recordLoginAttempt', error);
  }
}

export async function checkPublicRateLimit(
  action: string,
  identifier: string,
  maxAttempts = SECURITY_CONFIG.publicFormRateLimit,
  windowMinutes = SECURITY_CONFIG.publicFormRateWindowMinutes,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_action: action,
    p_identifier: identifier,
    p_max_attempts: maxAttempts,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    logServerError('checkPublicRateLimit', error);
  }

  return isPublicRateLimitAllowed(error, data);
}

export { toAuthError };
