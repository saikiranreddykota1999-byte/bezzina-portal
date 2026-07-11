import { describe, expect, it } from 'vitest';
import { isStaffRole, STAFF_ROLES } from '@/lib/auth/roles';

describe('isStaffRole', () => {
  it('returns true for admin and staff roles', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('staff')).toBe(true);
  });

  it('returns false for customer and invalid roles', () => {
    expect(isStaffRole('customer')).toBe(false);
    expect(isStaffRole('guest')).toBe(false);
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });

  it('exposes the staff role list', () => {
    expect(STAFF_ROLES).toEqual(['admin', 'staff']);
  });
});
