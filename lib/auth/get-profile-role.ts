import type { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

export async function getProfileRole(
  admin: AdminClient,
  userId: string,
): Promise<string | null> {
  const { data } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle();
  return data?.role ?? null;
}
