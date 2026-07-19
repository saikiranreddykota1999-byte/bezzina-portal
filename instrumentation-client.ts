import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// No-op when DSN is unset (local/CI without secrets).
Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  // Tunable: raise for more performance data, lower to control Sentry cost.
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
