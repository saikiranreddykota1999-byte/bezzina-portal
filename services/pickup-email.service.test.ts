import { describe, expect, it } from 'vitest';
import { buildPickupConfirmationEmail } from '@/services/pickup-email.service';

describe('pickup confirmation email', () => {
  it('includes pickup code and branch details', () => {
    const email = buildPickupConfirmationEmail({
      orderNumber: 'JB-2026-1234',
      pickupCode: 'PKP-ABC123',
      recipientEmail: 'customer@example.com',
      recipientName: 'Jane Doe',
      location: {
        id: 'loc-1',
        name: 'Marsa Main Branch',
        slug: 'marsa-main',
        line1: '5/6 Triq Aldo Moro',
        line2: null,
        city: 'Il-Marsa',
        postal_code: 'MRS 9065',
        country: 'Malta',
        phone: '+356 2122 6647',
        email: 'jason@jbezzina.com',
        instructions: 'Bring photo ID.',
        is_active: true,
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      pickupDate: '2026-07-15',
      pickupTime: '10:00:00',
    });

    expect(email.subject).toContain('JB-2026-1234');
    expect(email.text).toContain('PKP-ABC123');
    expect(email.text).toContain('Marsa Main Branch');
  });
});
