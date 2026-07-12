'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser, requireStaffUser } from '@/lib/auth/server-session';
import { submitQuoteCustomerSchema } from '@/lib/validators/quote';
import { notifyStaff } from '@/services/notification.service';
import { logActivity } from '@/services/activity-log.service';
import type { QuoteCartItem } from '@/types/quote';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export type QuoteCustomerPrefill = {
  name: string;
  email: string;
  phone: string;
};

function generateQuoteReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `QR-${date}-${rand}`;
}

function resolveCustomerEmail(
  contactEmail: string | null | undefined,
  profileEmail: string | null | undefined,
  authEmail: string | null | undefined,
): string {
  const candidates = [contactEmail, profileEmail, authEmail];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !trimmed.includes('@phone.otp.bezzina')) {
      return trimmed;
    }
  }
  return '';
}

export async function getQuoteCustomerPrefillAction(): Promise<
  ActionResult<QuoteCustomerPrefill>
> {
  try {
    const session = await getAuthenticatedUser();
    const { user, profile } = session;

    if (!user) {
      return { success: true, data: { name: '', email: '', phone: '' } };
    }

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

    return {
      success: true,
      data: {
        name:
          profile?.full_name ??
          (typeof metadata.full_name === 'string' ? metadata.full_name : '') ??
          '',
        email: resolveCustomerEmail(
          profile?.contact_email,
          profile?.email,
          user.email,
        ),
        phone:
          profile?.phone ??
          user.phone ??
          (typeof metadata.phone === 'string' ? metadata.phone : '') ??
          '',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load your details',
    };
  }
}

export async function submitQuoteRequest(
  items: QuoteCartItem[],
  customerInput: unknown,
  notes?: string,
): Promise<ActionResult<{ reference: string }>> {
  if (items.length === 0) {
    return { success: false, error: 'Quote cart is empty' };
  }

  const parsed = submitQuoteCustomerSchema.safeParse(customerInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid contact details',
    };
  }

  try {
    const session = await getAuthenticatedUser();
    const supabase = session.supabase;
    const reference = generateQuoteReference();
    const customer = parsed.data;

    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        user_id: session.user?.id ?? null,
        reference,
        status: 'pending',
        notes: notes?.trim() || null,
        customer_notes: notes?.trim() || null,
        channel: 'web',
        customer_email: customer.email,
        customer_name: customer.name,
        customer_phone: customer.phone,
        timeline: [{ status: 'pending', created_at: new Date().toISOString() }],
      })
      .select('id')
      .single();

    if (quoteError) return { success: false, error: quoteError.message };

    const rows = items.map((item) => ({
      quote_request_id: quote.id,
      product_id: item.productId,
      sku: item.sku,
      name: item.name,
      slug: item.slug,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from('quote_request_items').insert(rows);

    if (itemsError) return { success: false, error: itemsError.message };

    await notifyStaff(
      'quote_new',
      `New quote request ${reference}`,
      `${customer.name} submitted ${items.length} item(s)`,
      '/admin/quotes',
    );

    await logActivity({
      userId: session.user?.id ?? null,
      action: 'quote.submit',
      entity: 'quote_request',
      entityId: quote.id,
      newValue: { reference, items: items.length },
    });

    revalidatePath('/account/quotes');
    return { success: true, data: { reference } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit quote',
    };
  }
}

export async function getUserQuoteHistory() {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) {
      return { success: false as const, error: 'Sign in to view quote history' };
    }
    const { data, error } = await session.supabase
      .from('quote_requests')
      .select('*, items:quote_request_items(*)')
      .eq('user_id', session.user!.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load quotes',
    };
  }
}

export async function getAdminQuoteRequests() {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*, items:quote_request_items(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load quotes',
    };
  }
}
