'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser, requireStaffUser } from '@/lib/auth/server-session';
import { createClient } from '@/lib/supabase/server';
import type { QuoteCartItem } from '@/types/quote';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

function generateQuoteReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `QR-${date}-${rand}`;
}

export async function submitQuoteRequest(
  items: QuoteCartItem[],
  notes?: string,
  channel: 'web' | 'whatsapp' = 'web',
): Promise<ActionResult<{ reference: string }>> {
  if (items.length === 0) {
    return { success: false, error: 'Quote cart is empty' };
  }

  try {
    const session = await getAuthenticatedUser();
    const supabase = session.supabase;
    const reference = generateQuoteReference();

    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        user_id: session.user?.id ?? null,
        reference,
        status: 'pending',
        notes: notes ?? null,
        channel,
        customer_email: session.user?.email ?? null,
        customer_name: session.profile?.full_name ?? null,
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
