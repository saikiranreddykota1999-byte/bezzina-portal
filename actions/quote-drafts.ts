'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import type { QuoteCartItem, QuoteDraft } from '@/types/quote';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const quoteCartItemSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number().int().min(1),
  unit: z.string(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
});

const saveDraftSchema = z.object({
  name: z.string().trim().min(1).max(128).default('Draft Quote'),
  items: z.array(quoteCartItemSchema).min(1),
  notes: z.string().trim().max(5000).optional(),
});

export async function getQuoteDrafts(): Promise<ActionResult<QuoteDraft[]>> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in to view saved quotes' };

    const { data, error } = await session.supabase
      .from('quote_drafts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data ?? []).map((row) => ({
        ...row,
        items: row.items as QuoteCartItem[],
      })) as QuoteDraft[],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load drafts',
    };
  }
}

export async function saveQuoteDraft(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in to save quote drafts' };

    const parsed = saveDraftSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid draft' };
    }

    const { data, error } = await session.supabase
      .from('quote_drafts')
      .insert({
        user_id: session.user.id,
        name: parsed.data.name,
        items: parsed.data.items,
        notes: parsed.data.notes ?? null,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/quote');
    revalidatePath('/account/quotes');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}

export async function deleteQuoteDraft(id: string): Promise<ActionResult> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in required' };

    const { error } = await session.supabase
      .from('quote_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/quote');
    revalidatePath('/account/quotes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete draft',
    };
  }
}
