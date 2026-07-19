'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { notifyStaff } from '@/services/notification.service';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import type { ActionResult } from '@/types/action';

const ticketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Please describe the issue in more detail').max(5000),
});

const suggestionSchema = z.object({
  message: z.string().trim().min(10, 'Please add more detail to your suggestion').max(5000),
});

export async function submitSupportTicketAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = ticketSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid ticket' };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user!.id,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: 'open',
      })
      .select('id')
      .single();

    if (error || !data) {
      logServerError('submitSupportTicketAction', error);
      return { success: false, error: toUserError(error) };
    }

    await notifyStaff(
      'system',
      `Support ticket: ${parsed.data.subject}`,
      parsed.data.message.slice(0, 200),
      '/admin/customers',
    );

    revalidatePath('/account/tickets');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    logServerError('submitSupportTicketAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function submitSuggestionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = suggestionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid suggestion' };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user!.id,
        message: parsed.data.message,
      })
      .select('id')
      .single();

    if (error || !data) {
      logServerError('submitSuggestionAction', error);
      return { success: false, error: toUserError(error) };
    }

    await notifyStaff(
      'system',
      'New catalogue suggestion',
      parsed.data.message.slice(0, 200),
      '/admin/products',
    );

    revalidatePath('/account/suggestions');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    logServerError('submitSuggestionAction', error);
    return { success: false, error: toUserError(error) };
  }
}
