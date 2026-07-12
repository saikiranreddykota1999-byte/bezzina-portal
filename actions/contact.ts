'use server';

import { contactEnquirySchema } from '@/lib/validators/contact';
import { sendContactEnquiryEmail } from '@/services/contact-email.service';
import { notifyStaff } from '@/services/notification.service';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function submitContactEnquiryAction(
  input: unknown,
): Promise<ActionResult<{ channel: 'email' | 'demo' }>> {
  try {
    const parsed = contactEnquirySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
    }

    const enquiry = parsed.data;
    const delivery = await sendContactEnquiryEmail(enquiry);

    await notifyStaff(
      'system',
      `Contact enquiry: ${enquiry.subject}`,
      `${enquiry.name} (${enquiry.email}) — ${enquiry.message.slice(0, 200)}`,
      '/contact',
    );

    return { success: true, data: { channel: delivery.channel } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send enquiry',
    };
  }
}
