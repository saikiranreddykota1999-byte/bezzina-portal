import { z } from 'zod';

/** Present when Turnstile is configured; empty/omitted allowed when server skips verification. */
export const turnstileTokenSchema = z.string().trim().max(2048).optional().or(z.literal(''));
