'use server';

import type { ActionResult } from '@/types/action';

import { headers } from 'next/headers';
import { contactEnquirySchema } from '@/lib/validators/contact';
import { sendContactEnquiryEmail } from '@/services/contact-email.service';
import { notifyStaff } from '@/services/notification.service';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';

export async function submitContactEnquiryAction(
  input: unknown,
): Promise<ActionResult<{ channel: 'email' | 'demo' }>> {
  try {
    const parsed = contactEnquirySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
    }

    const enquiry = parsed.data;

    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const allowed = await checkPublicRateLimit('contact_form', `${ip}:${enquiry.email}`);
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
