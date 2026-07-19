import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isPortalRole, isSuperAdminRole } from '@/lib/auth/roles';
import { withTimeout } from '@/lib/auth/timeout';
import {
  ADMIN_CHANGE_PASSWORD_PATH,
  isAdminPasswordChangePath,
} from '@/lib/auth/staff-setup';
import {
  getSuperAdminMfaStatus,
  isSuperAdminMfaPath,
  isSuperAdminMfaRequired,
  resolveSuperAdminMfaRedirect,
} from '@/lib/auth/super-admin-mfa';

const ADMIN_LOGIN = '/admin/login';
const AUTH_TIMEOUT_MS = 8_000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const PUBLIC_ACCOUNT_PATHS = [
  '/account/login',
  '/account/register',
  '/account/forgot-password',
  '/account/reset-password',
  '/account/cart',
  '/account/wishlist',
];

function isPublicAccountPath(pathname: string) {
  return PUBLIC_ACCOUNT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

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

  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS, 'Session check');
    user = authUser;
  } catch (error) {
    console.error('middleware session check failed:', error);

    if (path.startsWith('/admin') && path !== ADMIN_LOGIN && !isAdminPasswordChangePath(path) && !isSuperAdminMfaPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('redirect', path);
      url.searchParams.set('error', 'session_timeout');
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/account') && !isPublicAccountPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      url.searchParams.set('redirect', path);
      url.searchParams.set('error', 'session_timeout');
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (path.startsWith('/admin') && path !== ADMIN_LOGIN && !isAdminPasswordChangePath(path) && !isSuperAdminMfaPath(path)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_disabled, force_password_change')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_disabled) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('error', 'disabled');
      return NextResponse.redirect(url);
    }

    if (!isPortalRole(profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    if (profile?.force_password_change) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_CHANGE_PASSWORD_PATH;
      return NextResponse.redirect(url);
    }

    if (isSuperAdminRole(profile?.role) && isSuperAdminMfaRequired()) {
      const mfaStatus = await getSuperAdminMfaStatus(supabase);
      const mfaRedirect = resolveSuperAdminMfaRedirect(mfaStatus, path);
      if (mfaRedirect) {
        const url = request.nextUrl.clone();
        url.pathname = mfaRedirect;
        return NextResponse.redirect(url);
      }
    }
  }

  if (path.startsWith('/admin') && (isAdminPasswordChangePath(path) || isSuperAdminMfaPath(path))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_disabled, force_password_change')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_disabled) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('error', 'disabled');
      return NextResponse.redirect(url);
    }

    if (isSuperAdminMfaPath(path) && !isSuperAdminRole(profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    if (profile?.force_password_change && isSuperAdminMfaPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_CHANGE_PASSWORD_PATH;
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith('/account') && !isPublicAccountPath(path) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/account/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  if (
    path.startsWith('/account') &&
    !isPublicAccountPath(path) &&
    user
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_disabled')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_disabled) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      url.searchParams.set('error', 'disabled');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export { MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES };
