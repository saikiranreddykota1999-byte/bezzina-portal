import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null;
}

export async function enforceRateLimit(params: {
  action: string;
  identifier: string;
  maxAttempts: number;
  windowMinutes: number;
}): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('check_rate_limit', {
    p_action: params.action,
    p_identifier: params.identifier,
    p_max_attempts: params.maxAttempts,
    p_window_minutes: params.windowMinutes,
  });
  return Boolean(data);
}
