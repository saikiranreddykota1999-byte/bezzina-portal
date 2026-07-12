'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/server-session';
import { logActivity } from '@/services/activity-log.service';
import { createNotification } from '@/services/notification.service';
import type { QuoteStatus, QuoteTimelineEntry } from '@/types/admin';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const quoteStatusSchema = z.enum([
  'pending',
  'in_review',
  'waiting_customer',
  'quoted',
  'approved',
  'accepted',
  'rejected',
  'completed',
  'cancelled',
  'expired',
]);

const updateQuoteSchema = z.object({
  id: z.string().uuid(),
  status: quoteStatusSchema,
  adminNotes: z.string().trim().max(5000).optional(),
});

export async function getAdminQuotesList() {
  try {
    const { supabase } = await requirePermission('quotes:manage');
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*, items:quote_request_items(*)')
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

export async function updateQuoteRequest(input: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('quotes:manage');
    const parsed = updateQuoteSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { data: existing } = await supabase
      .from('quote_requests')
      .select('status, timeline, user_id, reference')
      .eq('id', parsed.data.id)
      .single();

    const timeline = (existing?.timeline as QuoteTimelineEntry[] | null) ?? [];
    const entry: QuoteTimelineEntry = {
      status: parsed.data.status as QuoteStatus,
      note: parsed.data.adminNotes,
      actor_id: user?.id,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('quote_requests')
      .update({
        status: parsed.data.status as QuoteStatus,
        admin_notes: parsed.data.adminNotes ?? null,
        timeline: [...timeline, entry],
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.id);

    if (error) return { success: false, error: error.message };

    if (existing?.user_id) {
      await createNotification({
        userId: existing.user_id,
        type: 'quote_updated',
        title: `Quote ${existing.reference} updated`,
        body: `Status changed to ${parsed.data.status.replace('_', ' ')}`,
        link: '/account/quotes',
      });
    }

    await logActivity({
      userId: user?.id ?? null,
      action: 'quote.status_update',
      entity: 'quote_request',
      entityId: parsed.data.id,
      oldValue: { status: existing?.status },
      newValue: { status: parsed.data.status },
    });

    revalidatePath('/admin/quotes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update quote',
    };
  }
}

export async function bulkUpdateQuoteStatus(
  ids: string[],
  status: QuoteStatus,
): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('quotes:manage');
    if (ids.length === 0) return { success: false, error: 'No quotes selected' };

    const { error } = await supabase
      .from('quote_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/quotes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk update failed',
    };
  }
}
