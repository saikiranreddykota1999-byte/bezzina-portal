import type { UserRole } from '@/types/user';
import type { AdminPermission } from '@/types/admin';

export const ADMIN_NAV = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', permission: 'dashboard:view' as const },
  { title: 'Orders', href: '/admin/orders', icon: 'ShoppingBag', permission: 'orders:view' as const },
  { title: 'Sales Portal', href: '/admin/sales', icon: 'UserRound', permission: 'sales:operate' as const },
  { title: 'Warehouse Admin', href: '/admin/warehouse-admin', icon: 'Warehouse', permission: 'warehouse:operate' as const, roles: ['warehouse_manager', 'warehouse_staff', 'admin', 'super_admin'] as UserRole[] },
  { title: 'Inventory Admin', href: '/admin/inventory-admin', icon: 'Boxes', permission: 'inventory:view' as const, roles: ['warehouse_manager', 'admin', 'super_admin'] as UserRole[] },
  { title: 'Reports Admin', href: '/admin/reports-admin', icon: 'BarChart3', permission: 'reports:view' as const, roles: ['sales_manager', 'warehouse_manager', 'admin', 'super_admin'] as UserRole[] },
  { title: 'Warehouse', href: '/admin/warehouse', icon: 'Warehouse', permission: 'warehouse:operate' as const },
  { title: 'Inventory', href: '/admin/inventory', icon: 'Boxes', permission: 'inventory:view' as const },
  { title: 'Reports', href: '/admin/reports', icon: 'BarChart3', permission: 'reports:view' as const },
  { title: 'Delivery', href: '/admin/delivery', icon: 'Truck', permission: 'delivery:operate' as const },
  { title: 'Activity Log', href: '/admin/activity-logs', icon: 'Activity', permission: 'audit:view' as const, roles: ['admin', 'super_admin', 'staff', 'sales_manager', 'warehouse_manager'] as UserRole[] },
  { title: 'Products', href: '/admin/products', icon: 'Package', permission: 'products:manage' as const },
  { title: 'Categories', href: '/admin/categories', icon: 'FolderTree', permission: 'categories:manage' as const },
  { title: 'Marine Categories', href: '/admin/categories/marine', icon: 'Anchor', permission: 'categories:manage' as const },
  { title: 'Industrial Categories', href: '/admin/categories/industrial', icon: 'Factory', permission: 'categories:manage' as const },
  { title: 'Quote Requests', href: '/admin/quotes', icon: 'FileText', permission: 'quotes:manage' as const },
  { title: 'Customers', href: '/admin/customers', icon: 'Users', permission: 'customers:manage' as const },
  { title: 'Careers', href: '/admin/careers', icon: 'Briefcase', permission: 'careers:manage' as const },
  { title: 'Applications', href: '/admin/careers/applications', icon: 'UserCheck', permission: 'careers:manage' as const },
  { title: 'Homepage', href: '/admin/homepage', icon: 'Home', permission: 'homepage:manage' as const },
  { title: 'Website Content', href: '/admin/website-content', icon: 'Globe', permission: 'homepage:manage' as const },
  { title: 'Media Library', href: '/admin/media', icon: 'Image', permission: 'media:manage' as const },
  { title: 'Newsletter', href: '/admin/newsletter', icon: 'Mail', permission: 'newsletter:manage' as const },
  { title: 'SEO', href: '/admin/seo', icon: 'Search', permission: 'seo:manage' as const },
  { title: 'Pickup Orders', href: '/admin/pickup-orders', icon: 'Store', permission: 'pickup:manage' as const },
  { title: 'Pickup Locations', href: '/admin/pickup-locations', icon: 'MapPin', permission: 'pickup:manage' as const },
  { title: 'Users & Roles', href: '/admin/users', icon: 'Shield', superAdminOnly: true, permission: 'users:manage' as const },
  { title: 'Settings', href: '/admin/settings', icon: 'Settings', superAdminOnly: true, permission: 'settings:manage' as const },
  { title: 'Profile', href: '/admin/profile', icon: 'UserCog', permission: 'dashboard:view' as const },
] as const satisfies ReadonlyArray<{
  title: string;
  href: string;
  icon: string;
  permission?: AdminPermission;
  superAdminOnly?: boolean;
  roles?: UserRole[];
}>;
