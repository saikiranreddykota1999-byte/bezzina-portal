import type { UserRole } from '@/types/user';

export const STAFF_ROLES: readonly UserRole[] = ['admin', 'super_admin', 'staff'];

export function isStaffRole(role: string | null | undefined): role is UserRole {
  return role === 'admin' || role === 'super_admin' || role === 'staff';
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === 'super_admin';
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'staff' || role === 'super_admin';
}
