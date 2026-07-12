import { ADMIN_NAV } from '@/config/admin-nav';
import type { AdminPermission } from '@/types/admin';

export function getAdminPermissionForSection(section: string): AdminPermission {
  const href = `/admin/${section}`;
  const item = ADMIN_NAV.find((nav) => nav.href === href);
  return item?.permission ?? 'dashboard:view';
}
