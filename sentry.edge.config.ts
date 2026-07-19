import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// Used by Next.js proxy/edge runtime (proxy.ts). No-op when DSN is unset.
Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  // Tunable: raise for more performance data, lower to control Sentry cost.
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
