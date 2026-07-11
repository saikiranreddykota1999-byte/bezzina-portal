import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isStaffRole } from '@/lib/auth/roles';

const ADMIN_LOGIN = '/admin/login';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin') && path !== ADMIN_LOGIN) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!isStaffRole(profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  const publicAccountPaths = [
    '/account/login',
    '/account/register',
    '/account/cart',
    '/account/wishlist',
    '/account/tracking',
    '/account/quotes',
  ];

  const isPublicAccount = publicAccountPaths.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (path.startsWith('/account') && !isPublicAccount && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/account/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export { MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES };
