import { describe, expect, it } from 'vitest';
import { isStaffRole, isSuperAdminRole, STAFF_ROLES } from '@/lib/auth/roles';
import { hasPermission } from '@/lib/auth/permissions';

describe('isStaffRole', () => {
  it('returns true for admin, super_admin, and legacy staff roles', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('super_admin')).toBe(true);
    expect(isStaffRole('staff')).toBe(true);
  });

  it('returns false for customer and invalid roles', () => {
    expect(isStaffRole('customer')).toBe(false);
    expect(isStaffRole(null)).toBe(false);
  });

  it('exposes staff role list', () => {
    expect(STAFF_ROLES).toContain('super_admin');
  });
});

describe('isSuperAdminRole', () => {
  it('returns true only for super_admin', () => {
    expect(isSuperAdminRole('super_admin')).toBe(true);
    expect(isSuperAdminRole('admin')).toBe(false);
  });
});

describe('hasPermission', () => {
  it('grants product management to admin', () => {
    expect(hasPermission('admin', 'products:manage')).toBe(true);
  });

  it('denies user management to admin', () => {
    expect(hasPermission('admin', 'users:manage')).toBe(false);
  });

  it('grants user management to super_admin', () => {
    expect(hasPermission('super_admin', 'users:manage')).toBe(true);
  });
});
