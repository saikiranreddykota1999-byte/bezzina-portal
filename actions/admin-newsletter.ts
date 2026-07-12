'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import type { NewsletterSubscriber } from '@/types/admin';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getNewsletterSubscribersAction(): Promise<ActionResult<NewsletterSubscriber[]>> {
  try {
    const { supabase } = await requirePermission('newsletter:manage');
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as NewsletterSubscriber[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load subscribers',
    };
  }
}

export async function deleteNewsletterSubscriberAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('newsletter:manage');
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/newsletter');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

export async function bulkDeleteSubscribersAction(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requirePermission('newsletter:manage');
    const { error } = await supabase.from('newsletter_subscribers').delete().in('id', ids);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/newsletter');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed',
    };
  }
}
