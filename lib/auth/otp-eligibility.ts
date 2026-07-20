import { isPortalRole } from '@/lib/auth/roles';

/**
 * Uniform client-facing copy — do not reveal whether an identifier belongs to staff.
 * Staff sessions remain blocked server-side.
 */
export const CUSTOMER_OTP_DENIED_ERROR =
  'Unable to send a login code for this account. Try another method or contact support.';

/** @deprecated Prefer CUSTOMER_OTP_DENIED_ERROR for client responses (enumeration-safe). */
export const STAFF_OTP_LOGIN_ERROR = CUSTOMER_OTP_DENIED_ERROR;

/**
 * Customer OTP / magic-link flows must never authenticate portal staff.
 */
export function assertCustomerOtpEligible(
  role: string | null | undefined,
): { ok: true } | { ok: false; error: string } {
  if (isPortalRole(role)) {
    return { ok: false, error: CUSTOMER_OTP_DENIED_ERROR };
  }
  return { ok: true };
}
