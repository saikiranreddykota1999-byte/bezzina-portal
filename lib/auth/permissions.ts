import type { AdminPermission } from '@/types/admin';
import type { UserRole } from '@/types/user';
import { isStaffRole, isSuperAdminRole } from '@/lib/auth/roles';

const ADMIN_PERMISSIONS: AdminPermission[] = [
  'dashboard:view',
  'products:manage',
  'categories:manage',
  'quotes:manage',
  'customers:manage',
  'careers:manage',
  'homepage:manage',
  'media:manage',
  'newsletter:manage',
  'seo:manage',
  'pickup:manage',
];

const SUPER_ADMIN_ONLY: AdminPermission[] = [
  'settings:manage',
  'users:manage',
];

const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  customer: [],
  admin: ADMIN_PERMISSIONS,
  super_admin: [...ADMIN_PERMISSIONS, ...SUPER_ADMIN_ONLY],
  staff: ADMIN_PERMISSIONS,
};

export function hasPermission(
  role: string | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role || role === 'customer') return false;
  const normalized = role === 'staff' ? 'admin' : role;
  if (!isStaffRole(normalized)) return false;
  const permissions = ROLE_PERMISSIONS[normalized as UserRole] ?? [];
  return permissions.includes(permission);
}

export function canManageUsers(role: string | null | undefined): boolean {
  return isSuperAdminRole(role);
}

export function canManageSettings(role: string | null | undefined): boolean {
  return isSuperAdminRole(role);
}

export function filterNavByRole<T extends { permission?: AdminPermission; superAdminOnly?: boolean }>(
  items: T[],
  role: string | null | undefined,
): T[] {
  return items.filter((item) => {
    if (item.superAdminOnly && !isSuperAdminRole(role)) return false;
    if (!item.permission) return isStaffRole(role);
    return hasPermission(role, item.permission);
  });
}
