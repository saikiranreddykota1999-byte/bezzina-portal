import type { UserRole } from '@/types/user';
import type { AdminPermission } from '@/types/admin';
import { isSuperAdminRole } from '@/lib/auth/roles';

export const OMS_PORTAL_ROLES: readonly UserRole[] = [
  'admin',
  'super_admin',
  'staff',
  'sales_manager',
  'salesman',
  'warehouse_manager',
  'warehouse_staff',
  'delivery_driver',
];

export const MANAGEMENT_ROLES: readonly UserRole[] = [
  'admin',
  'super_admin',
  'sales_manager',
];

export const WAREHOUSE_ROLES: readonly UserRole[] = [
  'warehouse_manager',
  'warehouse_staff',
];

export const SALES_ROLES: readonly UserRole[] = [
  'salesman',
  'sales_manager',
];

export function isOmsPortalRole(role: string | null | undefined): boolean {
  return OMS_PORTAL_ROLES.includes(role as UserRole);
}

export function isManagementRole(role: string | null | undefined): boolean {
  return MANAGEMENT_ROLES.includes(role as UserRole) || isSuperAdminRole(role);
}

export function isWarehouseRole(role: string | null | undefined): boolean {
  return WAREHOUSE_ROLES.includes(role as UserRole) || isManagementRole(role);
}

export function isSalesRole(role: string | null | undefined): boolean {
  return SALES_ROLES.includes(role as UserRole) || isManagementRole(role);
}

export function isDeliveryRole(role: string | null | undefined): boolean {
  return role === 'delivery_driver' || isManagementRole(role);
}

const BASE_ADMIN: AdminPermission[] = [
  'dashboard:view',
  'audit:view',
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
  'orders:view',
  'orders:manage',
  'warehouse:manage',
  'inventory:manage',
  'sales:manage',
  'delivery:manage',
  'reports:view',
];

const SALES_MANAGER: AdminPermission[] = [
  'dashboard:view',
  'audit:view',
  'orders:view',
  'orders:manage',
  'orders:approve',
  'customers:manage',
  'quotes:manage',
  'sales:manage',
  'reports:view',
];

const SALESMAN: AdminPermission[] = [
  'dashboard:view',
  'orders:view',
  'sales:operate',
  'customers:view',
];

const WAREHOUSE_MANAGER: AdminPermission[] = [
  'dashboard:view',
  'audit:view',
  'orders:view',
  'warehouse:manage',
  'inventory:manage',
  'reports:view',
];

const WAREHOUSE_STAFF: AdminPermission[] = [
  'dashboard:view',
  'orders:view',
  'warehouse:operate',
  'inventory:view',
];

const DELIVERY_DRIVER: AdminPermission[] = [
  'dashboard:view',
  'orders:view',
  'delivery:operate',
];

export const OMS_ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  customer: [],
  admin: BASE_ADMIN,
  super_admin: [...BASE_ADMIN, 'settings:manage', 'users:manage'],
  staff: BASE_ADMIN,
  sales_manager: SALES_MANAGER,
  salesman: SALESMAN,
  warehouse_manager: WAREHOUSE_MANAGER,
  warehouse_staff: WAREHOUSE_STAFF,
  delivery_driver: DELIVERY_DRIVER,
};

export function hasOmsPermission(
  role: string | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role || role === 'customer') return false;
  const normalized = role === 'staff' ? 'admin' : role;
  const permissions = OMS_ROLE_PERMISSIONS[normalized as UserRole] ?? [];
  return permissions.includes(permission);
}

export function getDefaultDashboardPath(role: string | null | undefined): string {
  if (role === 'warehouse_manager' || role === 'warehouse_staff') return '/admin/warehouse-admin';
  if (role === 'salesman') return '/admin/sales';
  if (role === 'delivery_driver') return '/admin/delivery';
  if (role === 'sales_manager') return '/admin/reports-admin';
  return '/admin';
}
