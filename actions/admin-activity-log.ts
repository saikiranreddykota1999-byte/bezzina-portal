'use server';

import { requirePermission } from '@/lib/auth/server-session';
import type { ActivityLog } from '@/types/admin';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export async function getActivityLogs(limit = 50): Promise<ActionResult<ActivityLog[]>> {
  try {
    const { supabase } = await requirePermission('dashboard:view');
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profile:profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as ActivityLog[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load activity logs',
    };
  }
}
