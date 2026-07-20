'use server';

import type { ActionResult } from '@/types/action';

import { headers } from 'next/headers';
import { contactEnquirySchema } from '@/lib/validators/contact';
import { sendContactEnquiryEmail } from '@/services/contact-email.service';
import { notifyStaff } from '@/services/notification.service';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { getClientIp } from '@/lib/security/rate-limit';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import { assertTurnstileToken } from '@/lib/security/turnstile';

export async function submitContactEnquiryAction(
  input: unknown,
): Promise<ActionResult<{ channel: 'email' | 'demo' }>> {
  try {
    const parsed = contactEnquirySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
    }

    const enquiry = parsed.data;

    const turnstile = await assertTurnstileToken(enquiry.turnstileToken, {
      expectedAction: 'contact',
    });
    if (!turnstile.ok) {
      return { success: false, error: turnstile.error };
    }

    let ip = 'unknown';
    try {
      ip =
        (await getClientIp()) ??
        (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown';
    } catch (error) {
      logServerError('submitContactEnquiryAction.ip', error);
    }

    let allowed = true;
    try {
      allowed = await checkPublicRateLimit('contact_form', `${ip}:${enquiry.email}`);
    } catch (error) {
      logServerError('submitContactEnquiryAction.rateLimit', error);
      // Fail open for contact enquiries if rate-limit infra is down.
      allowed = true;
    }
    if (!allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    const delivery = await sendContactEnquiryEmail(enquiry);

    await notifyStaff(
      'system',
      `Contact enquiry: ${enquiry.subject}`,
      `${enquiry.name} (${enquiry.email}) — ${enquiry.message.slice(0, 200)}`,
      '/contact',
    );

    return { success: true, data: { channel: delivery.channel } };
  } catch (error) {
    logServerError('submitContactEnquiryAction', error);
    return { success: false, error: toUserError(error) };
  }
}
