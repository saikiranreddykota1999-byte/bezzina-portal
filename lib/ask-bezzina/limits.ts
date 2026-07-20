import { checkPublicRateLimit } from '@/lib/auth/login-security';

/** Ask Bezzina cost / abuse controls (override via env). */
export const ASK_BEZZINA_LIMITS = {
  /** All Ask Bezzina requests (including local FAQ) per IP / window */
  requestMax: Number(process.env.ASK_BEZZINA_RATE_LIMIT ?? 12),
  requestWindowMinutes: Number(process.env.ASK_BEZZINA_RATE_WINDOW_MINUTES ?? 15),
  /** Image uploads per IP / window (stricter — vision is expensive) */
  imageMax: Number(process.env.ASK_BEZZINA_IMAGE_RATE_LIMIT ?? 3),
  imageWindowMinutes: Number(process.env.ASK_BEZZINA_IMAGE_RATE_WINDOW_MINUTES ?? 15),
  /** Gemini calls per IP / day (spend breaker) */
  dailyIpMax: Number(process.env.ASK_BEZZINA_DAILY_IP_LIMIT ?? 40),
  /** Global Gemini calls / day across all IPs */
  dailyGlobalMax: Number(process.env.ASK_BEZZINA_DAILY_GLOBAL_LIMIT ?? 1500),
  dailyWindowMinutes: 24 * 60,
  /** Max image bytes for Ask Bezzina (smaller than general image uploads) */
  maxImageBytes: Number(process.env.ASK_BEZZINA_MAX_IMAGE_BYTES ?? 2 * 1024 * 1024),
} as const;

export async function assertAskBezzinaRequestBudget(params: {
  ip: string;
  hasImage: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const requestAllowed = await checkPublicRateLimit(
    'ask_bezzina',
    params.ip,
    ASK_BEZZINA_LIMITS.requestMax,
    ASK_BEZZINA_LIMITS.requestWindowMinutes,
  );
  if (!requestAllowed) {
    return { ok: false, error: 'Too many Ask Bezzina requests. Please try again later.' };
  }

  if (params.hasImage) {
    const imageAllowed = await checkPublicRateLimit(
      'ask_bezzina_image',
      params.ip,
      ASK_BEZZINA_LIMITS.imageMax,
      ASK_BEZZINA_LIMITS.imageWindowMinutes,
    );
    if (!imageAllowed) {
      return {
        ok: false,
        error: 'Photo limit reached. Try again later, or send a text description / contact us.',
      };
    }
  }

  return { ok: true };
}

/**
 * Spend breaker before calling Gemini. Counts against IP + global daily budgets.
 */
export async function assertAskBezzinaGeminiBudget(
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ipAllowed = await checkPublicRateLimit(
    'ask_bezzina_gemini_daily_ip',
    ip,
    ASK_BEZZINA_LIMITS.dailyIpMax,
    ASK_BEZZINA_LIMITS.dailyWindowMinutes,
  );
  if (!ipAllowed) {
    return {
      ok: false,
      error: 'Daily Ask Bezzina limit reached. Please contact us / WhatsApp for help.',
    };
  }

  const globalAllowed = await checkPublicRateLimit(
    'ask_bezzina_gemini_daily_global',
    'global',
    ASK_BEZZINA_LIMITS.dailyGlobalMax,
    ASK_BEZZINA_LIMITS.dailyWindowMinutes,
  );
  if (!globalAllowed) {
    return {
      ok: false,
      error: 'Ask Bezzina is at capacity today. Please contact us / WhatsApp for help.',
    };
  }

  return { ok: true };
}
