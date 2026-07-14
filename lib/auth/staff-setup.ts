import type { UserRole } from '@/types/user';

export const ADMIN_CHANGE_PASSWORD_PATH = '/admin/change-password';

export function mustChangePassword(
  profile: { force_password_change?: boolean | null } | null | undefined,
): boolean {
  return profile?.force_password_change === true;
}

export function isAdminPasswordChangePath(pathname: string): boolean {
  return (
    pathname === ADMIN_CHANGE_PASSWORD_PATH ||
    pathname.startsWith(`${ADMIN_CHANGE_PASSWORD_PATH}/`)
  );
}

export type StaffSeedRole = Exclude<
  UserRole,
  'customer' | 'super_admin' | 'staff'
>;

export const STAFF_SEED_ACCOUNTS: ReadonlyArray<{
  role: StaffSeedRole;
  emailTag: string;
  displayName: string;
  passwordEnvKey: string;
}> = [
  {
    role: 'admin',
    emailTag: 'admin',
    displayName: 'Portal Admin',
    passwordEnvKey: 'STAFF_ADMIN_PASSWORD',
  },
  {
    role: 'sales_manager',
    emailTag: 'salesmanager',
    displayName: 'Sales Manager',
    passwordEnvKey: 'STAFF_SALES_MANAGER_PASSWORD',
  },
  {
    role: 'salesman',
    emailTag: 'salesman',
    displayName: 'Salesman',
    passwordEnvKey: 'STAFF_SALESMAN_PASSWORD',
  },
  {
    role: 'warehouse_manager',
    emailTag: 'warehousemanager',
    displayName: 'Warehouse Manager',
    passwordEnvKey: 'STAFF_WAREHOUSE_MANAGER_PASSWORD',
  },
  {
    role: 'warehouse_staff',
    emailTag: 'warehousestaff',
    displayName: 'Warehouse Staff',
    passwordEnvKey: 'STAFF_WAREHOUSE_STAFF_PASSWORD',
  },
  {
    role: 'delivery_driver',
    emailTag: 'deliverydriver',
    displayName: 'Delivery Driver',
    passwordEnvKey: 'STAFF_DELIVERY_DRIVER_PASSWORD',
  },
];

/** Gmail-style plus addressing: one inbox, unique Supabase auth users per role. */
export function buildStaffEmail(baseEmail: string, emailTag: string): string {
  const normalized = baseEmail.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0) {
    throw new Error('STAFF_BASE_EMAIL must be a valid email address');
  }
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  return `${local}+${emailTag}@${domain}`;
}
