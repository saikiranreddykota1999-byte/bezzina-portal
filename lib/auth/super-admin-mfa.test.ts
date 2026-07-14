import { describe, expect, it } from 'vitest';
import {
  ADMIN_MFA_SETUP_PATH,
  ADMIN_MFA_VERIFY_PATH,
  isSuperAdminMfaPath,
  resolveSuperAdminMfaRedirect,
  type SuperAdminMfaStatus,
} from '@/lib/auth/super-admin-mfa';

function buildStatus(overrides: Partial<SuperAdminMfaStatus> = {}): SuperAdminMfaStatus {
  return {
    required: true,
    enrolled: false,
    verified: false,
    currentLevel: 'aal1',
    nextLevel: 'aal2',
    factorId: null,
    ...overrides,
  };
}

describe('isSuperAdminMfaPath', () => {
  it('matches setup and verify routes', () => {
    expect(isSuperAdminMfaPath(ADMIN_MFA_SETUP_PATH)).toBe(true);
    expect(isSuperAdminMfaPath(ADMIN_MFA_VERIFY_PATH)).toBe(true);
    expect(isSuperAdminMfaPath('/admin/products')).toBe(false);
  });
});

describe('resolveSuperAdminMfaRedirect', () => {
  it('redirects unenrolled super admins to setup', () => {
    expect(resolveSuperAdminMfaRedirect(buildStatus(), '/admin')).toBe(ADMIN_MFA_SETUP_PATH);
  });

  it('allows setup page when MFA is not yet enrolled', () => {
    expect(resolveSuperAdminMfaRedirect(buildStatus(), ADMIN_MFA_SETUP_PATH)).toBeNull();
  });

  it('redirects enrolled but unverified users to verify', () => {
    const status = buildStatus({ enrolled: true, factorId: 'factor-1' });
    expect(resolveSuperAdminMfaRedirect(status, '/admin')).toBe(ADMIN_MFA_VERIFY_PATH);
  });

  it('allows verify page while step-up is pending', () => {
    const status = buildStatus({ enrolled: true, factorId: 'factor-1' });
    expect(resolveSuperAdminMfaRedirect(status, ADMIN_MFA_VERIFY_PATH)).toBeNull();
  });

  it('sends verified users away from MFA pages', () => {
    const status = buildStatus({
      enrolled: true,
      verified: true,
      currentLevel: 'aal2',
      nextLevel: 'aal2',
      factorId: 'factor-1',
    });
    expect(resolveSuperAdminMfaRedirect(status, ADMIN_MFA_VERIFY_PATH)).toBe('/admin');
  });

  it('skips redirects when MFA is not required', () => {
    expect(
      resolveSuperAdminMfaRedirect(buildStatus({ required: false }), '/admin'),
    ).toBeNull();
  });
});
