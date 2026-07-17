import { isPortalRole } from '@/lib/auth/roles';

export const STAFF_OTP_LOGIN_ERROR =
  'This account must sign in through the staff login page.';

/**
 * Customer OTP / magic-link flows must never authenticate portal staff.
 */
export function assertCustomerOtpEligible(
  role: string | null | undefined,
): { ok: true } | { ok: false; error: string } {
  if (isPortalRole(role)) {
    return { ok: false, error: STAFF_OTP_LOGIN_ERROR };
  }
  return { ok: true };
}
