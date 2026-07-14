import type { AdminPermission } from '@/types/admin';
import type { UserRole } from '@/types/user';
import { isStaffRole, isSuperAdminRole } from '@/lib/auth/roles';
import { hasOmsPermission, OMS_ROLE_PERMISSIONS } from '@/lib/auth/oms-permissions';

const ADMIN_PERMISSIONS: AdminPermission[] = OMS_ROLE_PERMISSIONS.admin;

const SUPER_ADMIN_ONLY: AdminPermission[] = [
  'settings:manage',
  'users:manage',
  'audit:view',
];

const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  customer: [],
  admin: ADMIN_PERMISSIONS,
  super_admin: [...ADMIN_PERMISSIONS, ...SUPER_ADMIN_ONLY],
  staff: ADMIN_PERMISSIONS,
  sales_manager: OMS_ROLE_PERMISSIONS.sales_manager,
  salesman: OMS_ROLE_PERMISSIONS.salesman,
  warehouse_manager: OMS_ROLE_PERMISSIONS.warehouse_manager,
  warehouse_staff: OMS_ROLE_PERMISSIONS.warehouse_staff,
  delivery_driver: OMS_ROLE_PERMISSIONS.delivery_driver,
};

export function hasPermission(
  role: string | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role || role === 'customer') return false;
  if (hasOmsPermission(role, permission)) return true;
  const normalized = role === 'staff' ? 'admin' : role;
  if (!isStaffRole(normalized) && !OMS_ROLE_PERMISSIONS[normalized as UserRole]) return false;
  const permissions = ROLE_PERMISSIONS[normalized as UserRole] ?? [];
  return permissions.includes(permission);
}

export function canManageUsers(role: string | null | undefined): boolean {
  return isSuperAdminRole(role);
}

export function canManageSettings(role: string | null | undefined): boolean {
  return isSuperAdminRole(role);
}

export function filterNavByRole<T extends { permission?: AdminPermission; superAdminOnly?: boolean; roles?: UserRole[] }>(
  items: T[],
  role: string | null | undefined,
): T[] {
  return items.filter((item) => {
    if (item.superAdminOnly && !isSuperAdminRole(role)) return false;
    if (item.roles?.length && role && !item.roles.includes(role as UserRole)) return false;
    if (!item.permission) return hasPermission(role, 'dashboard:view');
    return hasPermission(role, item.permission);
  });
}
