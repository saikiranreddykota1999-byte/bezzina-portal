import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import { ensureCustomerProfile } from '@/lib/auth/ensure-customer-profile';
import { isPortalRole } from '@/lib/auth/roles';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_disabled')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.is_disabled) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/account/login?error=disabled`);
        }

        if (isPortalRole(profile?.role)) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/admin/login?error=staff_oauth`);
        }

        await ensureCustomerProfile(data.user);
      } catch (profileError) {
        console.error('OAuth profile setup failed:', profileError);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/account/login?error=auth_callback_failed`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth_callback_failed`);
}
