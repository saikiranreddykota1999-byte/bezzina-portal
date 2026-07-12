import { createAdminClient } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

function resolveFullName(user: User): string | null {
  const metadata = user.user_metadata ?? {};
  const name =
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    (typeof metadata.name === 'string' && metadata.name) ||
    null;
  return name;
}

function resolveAvatarUrl(user: User): string | null {
  const metadata = user.user_metadata ?? {};
  const avatar =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
    (typeof metadata.picture === 'string' && metadata.picture) ||
    null;
  return avatar;
}

export async function ensureCustomerProfile(user: User): Promise<void> {
  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const email = user.email?.toLowerCase() ?? '';
  const fullName = existingProfile?.full_name ?? resolveFullName(user);
  const avatarUrl = existingProfile?.avatar_url ?? resolveAvatarUrl(user);

  await admin.from('profiles').upsert({
    id: user.id,
    email,
    contact_email: email || null,
    full_name: fullName,
    avatar_url: avatarUrl,
    ...(existingProfile?.role ? { role: existingProfile.role } : { role: 'customer' as const }),
  });
}
