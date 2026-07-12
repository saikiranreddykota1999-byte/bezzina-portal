import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationType } from '@/types/notification';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error('notification_create_failed', error);
  }
}

export async function notifyStaff(
  type: NotificationType,
  title: string,
  body?: string,
  link?: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: staff } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .eq('is_disabled', false);

    if (!staff?.length) return;

    await supabase.from('notifications').insert(
      staff.map((s) => ({
        user_id: s.id,
        type,
        title,
        body: body ?? null,
        link: link ?? null,
      })),
    );
  } catch (error) {
    console.error('notify_staff_failed', error);
  }
}
