'use server';

import { getAdminClientConfigError, createAdminClient } from '@/lib/supabase/admin';
import { isEmailOtpConfigured } from '@/services/otp-email.service';
import { isSmsConfigured } from '@/services/sms.service';

export type CustomerAuthConfigStatus = {
  adminConfigured: boolean;
  adminError: string | null;
  emailDeliveryConfigured: boolean;
  smsDeliveryConfigured: boolean;
  demoMode: boolean;
  isDevelopment: boolean;
  otpTablesReady: boolean;
  otpTablesError: string | null;
};

const PUBLIC_AUTH_ERROR =
  'Authentication is temporarily unavailable. Please try again later.';

function publicAuthError(detail: string | null): string | null {
  if (!detail) return null;
  return process.env.NODE_ENV === 'production' ? PUBLIC_AUTH_ERROR : detail;
}

export async function getCustomerAuthConfigStatus(): Promise<CustomerAuthConfigStatus> {
  const adminError = getAdminClientConfigError();

  if (adminError) {
    return {
      adminConfigured: false,
      adminError: publicAuthError(adminError),
      emailDeliveryConfigured: isEmailOtpConfigured(),
      smsDeliveryConfigured: isSmsConfigured(),
      demoMode: true,
      isDevelopment: process.env.NODE_ENV !== 'production',
      otpTablesReady: false,
      otpTablesError: publicAuthError(adminError),
    };
  }

  try {
    const admin = createAdminClient();
    const [{ error: emailTableError }, { error: phoneTableError }] = await Promise.all([
      admin.from('email_otp_codes').select('id', { head: true, count: 'exact' }),
      admin.from('phone_otp_codes').select('id', { head: true, count: 'exact' }),
    ]);

    const otpTablesError = emailTableError?.message ?? phoneTableError?.message ?? null;

    return {
      adminConfigured: true,
      adminError: null,
      emailDeliveryConfigured: isEmailOtpConfigured(),
      smsDeliveryConfigured: isSmsConfigured(),
      demoMode: !isEmailOtpConfigured() && !isSmsConfigured(),
      isDevelopment: process.env.NODE_ENV !== 'production',
      otpTablesReady: !otpTablesError,
      otpTablesError: publicAuthError(otpTablesError),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auth backend check failed';
    return {
      adminConfigured: false,
      adminError: publicAuthError(message),
      emailDeliveryConfigured: isEmailOtpConfigured(),
      smsDeliveryConfigured: isSmsConfigured(),
      demoMode: true,
      isDevelopment: process.env.NODE_ENV !== 'production',
      otpTablesReady: false,
      otpTablesError: publicAuthError(message),
    };
  }
}
