'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, getAuthenticatedUser } from '@/lib/auth/server-session';
import type { Notification } from '@/types/notification';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getNotifications(): Promise<ActionResult<Notification[]>> {
  try {
    const { supabase, user } = await requirePermission('dashboard:view');
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Notification[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load notifications',
    };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return 0;

    const { count } = await session.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('dashboard:view');
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notifications read',
    };
  }
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requirePermission('dashboard:view');
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification',
    };
  }
}
