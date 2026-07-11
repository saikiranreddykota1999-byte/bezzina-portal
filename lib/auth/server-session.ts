import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isStaffRole } from '@/lib/auth/roles';
import { withTimeout } from '@/lib/auth/timeout';

const AUTH_TIMEOUT_MS = 8_000;

type Profile = {
  id: string;
  email: string | null;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  contact_email: string | null;
  billing_address: string | null;
  company_name: string | null;
  vat_number: string | null;
};

export type AuthenticatedSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
  profile: Profile | null;
  authError: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedSession> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS, 'Session check');

    if (error) {
      return { supabase, user: null, profile: null, authError: error.message };
    }

    if (!user) {
      return { supabase, user: null, profile: null, authError: null };
    }

    const { data: profile, error: profileError } = await withTimeout(
      supabase
        .from('profiles')
        .select(
          'id, email, role, full_name, phone, contact_email, billing_address, company_name, vat_number',
        )
        .eq('id', user.id)
        .maybeSingle(),
      AUTH_TIMEOUT_MS,
      'Profile lookup',
    );

    if (profileError) {
      console.error('getAuthenticatedUser profile error:', profileError.message);
    }

    return { supabase, user, profile: profile ?? null, authError: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to verify your session';
    console.error('getAuthenticatedUser error:', message);
    return { supabase, user: null, profile: null, authError: message };
  }
}

export async function requireAuthenticatedUser() {
  const session = await getAuthenticatedUser();

  if (session.authError) {
    throw new Error(session.authError);
  }

  if (!session.user) {
    redirect('/account/login?redirect=/account');
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
