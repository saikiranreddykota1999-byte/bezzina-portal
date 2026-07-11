import type { UserRole } from '@/types/user';

export const STAFF_ROLES: readonly UserRole[] = ['admin', 'staff'];

export function isStaffRole(role: string | null | undefined): role is UserRole {
  return role === 'admin' || role === 'staff';
}
