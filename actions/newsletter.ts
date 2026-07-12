'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { newsletterSubscribeSchema } from '@/lib/validators/newsletter';

type ActionResult = { success: true } | { success: false; error: string };

export async function subscribeNewsletterAction(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid email address',
    };
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase();

  const { error } = await supabase.from('newsletter_subscribers').upsert(
    { email, is_active: true, unsubscribed_at: null },
    { onConflict: 'email' },
  );

  if (error) {
    if (error.code === '23505') {
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/newsletter');
  return { success: true };
}
