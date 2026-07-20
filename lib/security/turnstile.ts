import { getClientIp } from '@/lib/security/rate-limit';
import { logServerError } from '@/lib/security/sanitize-error';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const TURNSTILE_FAILED_ERROR =
  'Bot check failed. Please refresh and try again.';

export const TURNSTILE_UNAVAILABLE_ERROR =
  'Bot protection is temporarily unavailable. Please try again later.';

type TurnstileSiteverifyResponse = {
  success?: boolean;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
};

function getTurnstileSecret(): string | null {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || null;
}

export function getTurnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSiteKey() && getTurnstileSecret());
}

/**
 * Production/preview require Turnstile once keys exist, or when TURNSTILE_REQUIRED=true.
 * Local development may skip when keys are absent.
 */
export function isTurnstileRequired(): boolean {
  if (process.env.TURNSTILE_REQUIRED === 'true') return true;
  if (process.env.TURNSTILE_REQUIRED === 'false') return false;

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'production' || vercelEnv === 'preview') {
    return isTurnstileConfigured();
  }

  return process.env.NODE_ENV === 'production' && isTurnstileConfigured();
}

export async function assertTurnstileToken(
  token: string | null | undefined,
  options?: { expectedAction?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const required = isTurnstileRequired();
  const configured = isTurnstileConfigured();

  if (!configured) {
    if (required) {
      return { ok: false, error: TURNSTILE_UNAVAILABLE_ERROR };
    }
    return { ok: true };
  }

  const trimmed = typeof token === 'string' ? token.trim() : '';
  if (!trimmed) {
    return { ok: false, error: TURNSTILE_FAILED_ERROR };
  }

  const secret = getTurnstileSecret();
  if (!secret) {
    return { ok: false, error: TURNSTILE_UNAVAILABLE_ERROR };
  }

  try {
    const ip = await getClientIp().catch(() => null);
    const body = new URLSearchParams({
      secret,
      response: trimmed,
    });
    if (ip) body.set('remoteip', ip);

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });

    if (!response.ok) {
      logServerError('assertTurnstileToken.http', new Error(`status ${response.status}`));
      return { ok: false, error: TURNSTILE_FAILED_ERROR };
    }

    const payload = (await response.json()) as TurnstileSiteverifyResponse;
    if (!payload.success) {
      return { ok: false, error: TURNSTILE_FAILED_ERROR };
    }

    if (
      options?.expectedAction &&
      payload.action &&
      payload.action !== options.expectedAction
    ) {
      return { ok: false, error: TURNSTILE_FAILED_ERROR };
    }

    return { ok: true };
  } catch (error) {
    logServerError('assertTurnstileToken', error);
    return { ok: false, error: TURNSTILE_FAILED_ERROR };
  }
}
