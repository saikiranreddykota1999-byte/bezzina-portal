/** Configurable security settings (override via env in production). */

export const SECURITY_CONFIG = {
  /** Failed login attempts before lockout */
  maxFailedLoginAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS ?? 5),
  /** Lockout duration in minutes */
  lockoutMinutes: Number(process.env.LOCKOUT_MINUTES ?? 15),
  /** Idle session timeout in minutes (0 = disabled) */
  inactivityTimeoutMinutes: Number(process.env.INACTIVITY_TIMEOUT_MINUTES ?? 30),
  /** Public form rate limit: max requests per window */
  publicFormRateLimit: Number(process.env.PUBLIC_FORM_RATE_LIMIT ?? 10),
  /** Public form rate limit window in minutes */
  publicFormRateWindowMinutes: Number(process.env.PUBLIC_FORM_RATE_WINDOW_MINUTES ?? 15),
  /** Bulk operation max IDs */
  bulkOperationMaxIds: Number(process.env.BULK_OPERATION_MAX_IDS ?? 100),
  /** Require TOTP MFA for super_admin (default: true in production) */
  requireSuperAdminMfa:
    (process.env.REQUIRE_SUPER_ADMIN_MFA ??
      (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true',
} as const;
