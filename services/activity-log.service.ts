import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export type ActivityLogInput = {
  userId: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
};

async function getRequestMeta() {
  const h = await headers();
  return {
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    userAgent: h.get('user-agent') ?? null,
  };
}

export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { ip, userAgent } = await getRequestMeta();

    await supabase.from('activity_logs').insert({
      user_id: input.userId,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      old_value: input.oldValue ?? null,
      new_value: input.newValue ?? null,
      metadata: input.metadata ?? null,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('activity_log_failed', error);
  }
}
