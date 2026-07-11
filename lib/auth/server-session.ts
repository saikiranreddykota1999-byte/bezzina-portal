import { createClient } from '@/lib/supabase/server';
import { isStaffRole } from '@/lib/auth/roles';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  return { supabase, user, profile };
}

export async function requireAuthenticatedUser() {
  const session = await getAuthenticatedUser();
  if (!session.user) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireStaffUser() {
  const session = await requireAuthenticatedUser();
  if (!isStaffRole(session.profile?.role)) {
    throw new Error('Admin access required');
  }
  return session;
}
