import { SECURITY_CONFIG } from '@/config/security';
import { isAdminPasswordChangePath } from '@/lib/auth/staff-setup';
import type { createClient } from '@/lib/supabase/server';

export const ADMIN_MFA_SETUP_PATH = '/admin/mfa/setup';
export const ADMIN_MFA_VERIFY_PATH = '/admin/mfa/verify';

export type AuthenticatorAssuranceLevel = 'aal1' | 'aal2';

export type SuperAdminMfaStatus = {
  required: boolean;
  enrolled: boolean;
  verified: boolean;
  currentLevel: AuthenticatorAssuranceLevel | null;
  nextLevel: AuthenticatorAssuranceLevel | null;
  factorId: string | null;
};

type MfaSupabase = Awaited<ReturnType<typeof createClient>>;

function toAssuranceLevel(value: string | null | undefined): AuthenticatorAssuranceLevel | null {
  if (value === 'aal1' || value === 'aal2') {
    return value;
  }
  return null;
}

export function isSuperAdminMfaRequired(): boolean {
  return SECURITY_CONFIG.requireSuperAdminMfa;
}

export function isSuperAdminMfaPath(pathname: string): boolean {
  return (
    pathname === ADMIN_MFA_SETUP_PATH ||
    pathname.startsWith(`${ADMIN_MFA_SETUP_PATH}/`) ||
    pathname === ADMIN_MFA_VERIFY_PATH ||
    pathname.startsWith(`${ADMIN_MFA_VERIFY_PATH}/`)
  );
}

export function isSuperAdminMfaExemptPath(pathname: string): boolean {
  return (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    isAdminPasswordChangePath(pathname) ||
    isSuperAdminMfaPath(pathname)
  );
}

export function resolveSuperAdminMfaRedirect(
  status: SuperAdminMfaStatus,
  pathname: string,
): string | null {
  if (!status.required) {
    return null;
  }

  if (status.verified) {
    return isSuperAdminMfaPath(pathname) ? '/admin' : null;
  }

  if (pathname === '/admin/login' || isAdminPasswordChangePath(pathname)) {
    return null;
  }

  if (!status.enrolled) {
    return pathname === ADMIN_MFA_SETUP_PATH ? null : ADMIN_MFA_SETUP_PATH;
  }

  if (!status.verified) {
    return pathname === ADMIN_MFA_VERIFY_PATH ? null : ADMIN_MFA_VERIFY_PATH;
  }

  return null;
}

export async function getSuperAdminMfaStatus(supabase: MfaSupabase): Promise<SuperAdminMfaStatus> {
  const required = isSuperAdminMfaRequired();

  const [{ data: aalData }, { data: factorsData }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const currentLevel = toAssuranceLevel(aalData?.currentLevel);
  const nextLevel = toAssuranceLevel(aalData?.nextLevel);
  const verifiedFactors =
    factorsData?.totp?.filter((factor) => factor.status === 'verified') ?? [];
  const enrolled = verifiedFactors.length > 0;
  const verified = currentLevel === 'aal2';

  return {
    required,
    enrolled,
    verified,
    currentLevel,
    nextLevel,
    factorId: verifiedFactors[0]?.id ?? null,
  };
}
