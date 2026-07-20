import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  assertTurnstileToken,
  isTurnstileConfigured,
  isTurnstileRequired,
} from '@/lib/security/turnstile';

describe('turnstile config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('is not configured without keys', () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    expect(isTurnstileConfigured()).toBe(false);
  });

  it('allows requests when not configured and not required', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.stubEnv('TURNSTILE_REQUIRED', 'false');
    vi.stubEnv('NODE_ENV', 'development');
    expect(isTurnstileRequired()).toBe(false);
    await expect(assertTurnstileToken(undefined)).resolves.toEqual({ ok: true });
  });

  it('rejects empty token when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    await expect(assertTurnstileToken('')).resolves.toMatchObject({ ok: false });
  });

  it('accepts a verified token', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    vi.stubEnv('TURNSTILE_REQUIRED', 'true');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, action: 'contact' }),
      }),
    );

    await expect(assertTurnstileToken('token', { expectedAction: 'contact' })).resolves.toEqual({
      ok: true,
    });
  });
});
