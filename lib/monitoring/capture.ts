import * as Sentry from '@sentry/nextjs';

type SafeExtra = Record<string, string | number | boolean | null | undefined>;

/**
 * Capture an exception in Sentry with non-PII context only
 * (IDs / operation names — never card data, secrets, or free-text PII).
 */
export function captureException(error: unknown, extra?: SafeExtra): void {
  Sentry.captureException(error, extra ? { extra } : undefined);
}
