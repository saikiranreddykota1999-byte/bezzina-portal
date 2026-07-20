'use server';

import type { ActionResult } from '@/types/action';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { newsletterSubscribeSchema } from '@/lib/validators/newsletter';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { getClientIp } from '@/lib/security/rate-limit';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import { assertTurnstileToken } from '@/lib/security/turnstile';

export async function subscribeNewsletterAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = newsletterSubscribeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid email address',
      };
    }

    const turnstile = await assertTurnstileToken(parsed.data.turnstileToken, {
      expectedAction: 'newsletter',
    });
    if (!turnstile.ok) {
      return { success: false, error: turnstile.error };
    }

    const supabase = await createClient();
    const email = parsed.data.email.toLowerCase();

    const ip =
      (await getClientIp()) ??
      (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown';
    const allowed = await checkPublicRateLimit('newsletter_subscribe', `${ip}:${email}`);
    if (!allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email, is_active: true, unsubscribed_at: null },
      { onConflict: 'email' },
    );

    if (error) {
      if (error.code === '23505') {
        return { success: true };
      }
      logServerError('subscribeNewsletterAction', error);
      return { success: false, error: toUserError(error) };
    }

    revalidatePath('/admin/newsletter');
    return { success: true };
  } catch (error) {
    logServerError('subscribeNewsletterAction', error);
    return { success: false, error: toUserError(error) };
  }
}
