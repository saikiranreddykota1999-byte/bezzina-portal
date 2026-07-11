import type { PickupLocation } from '@/types/pickup';
import { formatPickupAddress, formatPickupDateTime } from '@/lib/checkout';

export type PickupConfirmationPayload = {
  orderNumber: string;
  pickupCode: string;
  recipientEmail: string;
  recipientName?: string | null;
  location: PickupLocation;
  pickupDate: string;
  pickupTime: string;
};

export function buildPickupConfirmationEmail(payload: PickupConfirmationPayload) {
  const when = formatPickupDateTime(payload.pickupDate, payload.pickupTime);
  const where = formatPickupAddress(payload.location);

  const subject = `Pickup confirmed — ${payload.orderNumber}`;

  const text = [
    `Hello${payload.recipientName ? ` ${payload.recipientName}` : ''},`,
    '',
    `Your store pickup order ${payload.orderNumber} is confirmed.`,
    '',
    `Pickup code: ${payload.pickupCode}`,
    `Branch: ${payload.location.name}`,
    `When: ${when}`,
    `Where: ${where}`,
    '',
    payload.location.instructions
      ? `Instructions: ${payload.location.instructions}`
      : 'Please bring your pickup code and photo ID.',
    '',
    'Joseph Bezzina & Co. Ltd',
  ].join('\n');

  const html = `
    <h1>Store pickup confirmed</h1>
    <p>Your order <strong>${payload.orderNumber}</strong> is scheduled for collection.</p>
    <p><strong>Pickup code:</strong> ${payload.pickupCode}</p>
    <p><strong>Branch:</strong> ${payload.location.name}<br/>${where}</p>
    <p><strong>When:</strong> ${when}</p>
    ${
      payload.location.instructions
        ? `<p><strong>Instructions:</strong> ${payload.location.instructions}</p>`
        : '<p>Please bring your pickup code and photo ID.</p>'
    }
  `;

  return { subject, text, html };
}

export async function sendPickupConfirmationEmail(
  payload: PickupConfirmationPayload,
): Promise<{ sent: boolean; status: 'sent' | 'queued' | 'failed' }> {
  const { subject, text, html } = buildPickupConfirmationEmail(payload);

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.PICKUP_EMAIL_FROM ?? 'orders@jbezzina.com';

  let status: 'sent' | 'queued' | 'failed' = 'queued';

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.recipientEmail,
          subject,
          text,
          html,
        }),
      });

      status = response.ok ? 'sent' : 'failed';
    } catch {
      status = 'failed';
    }
  }

  return { sent: status === 'sent', status };
}
