import type { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Resolve an Auth user by email via profiles (indexed) then Auth Admin API.
 * Avoids listUsers(perPage: 1000) enumeration.
 */
export async function findAuthUserIdByEmail(
  admin: AdminClient,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase();

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalized)
    .maybeSingle();

  if (profile?.id) {
    return profile.id;
  }

  const { data: contactProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('contact_email', normalized)
    .maybeSingle();

  return contactProfile?.id ?? null;
}

export async function getAuthUserEmailById(
  admin: AdminClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    return null;
  }
  return data.user.email ?? null;
}
