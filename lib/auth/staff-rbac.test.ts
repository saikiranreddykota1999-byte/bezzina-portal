import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';
import { getDefaultDashboardPath } from '@/lib/auth/oms-permissions';
import { buildStaffEmail } from '@/lib/auth/staff-setup';

describe('buildStaffEmail', () => {
  it('creates plus-addressed emails per role', () => {
    expect(buildStaffEmail('saikiranreddy.kota1999@gmail.com', 'admin')).toBe(
      'saikiranreddy.kota1999+admin@gmail.com',
    );
  });
});

describe('staff RBAC matrix', () => {
  it('admin can manage CMS but not users/settings', () => {
    expect(hasPermission('admin', 'products:manage')).toBe(true);
    expect(hasPermission('admin', 'users:manage')).toBe(false);
    expect(hasPermission('admin', 'settings:manage')).toBe(false);
  });

  it('sales manager can approve orders and view reports', () => {
    expect(hasPermission('sales_manager', 'orders:approve')).toBe(true);
    expect(hasPermission('sales_manager', 'reports:view')).toBe(true);
    expect(hasPermission('sales_manager', 'settings:manage')).toBe(false);
  });

  it('salesman can operate sales but not manage settings', () => {
    expect(hasPermission('salesman', 'sales:operate')).toBe(true);
    expect(hasPermission('salesman', 'orders:view')).toBe(true);
    expect(hasPermission('salesman', 'settings:manage')).toBe(false);
    expect(hasPermission('salesman', 'products:manage')).toBe(false);
  });

  it('warehouse manager can manage inventory and warehouse', () => {
    expect(hasPermission('warehouse_manager', 'warehouse:manage')).toBe(true);
    expect(hasPermission('warehouse_manager', 'inventory:manage')).toBe(true);
    expect(hasPermission('warehouse_manager', 'settings:manage')).toBe(false);
  });

  it('warehouse staff can operate warehouse but not manage inventory', () => {
    expect(hasPermission('warehouse_staff', 'warehouse:operate')).toBe(true);
    expect(hasPermission('warehouse_staff', 'inventory:view')).toBe(true);
    expect(hasPermission('warehouse_staff', 'inventory:manage')).toBe(false);
  });

  it('delivery driver has delivery access only', () => {
    expect(hasPermission('delivery_driver', 'delivery:operate')).toBe(true);
    expect(hasPermission('delivery_driver', 'products:manage')).toBe(false);
    expect(hasPermission('delivery_driver', 'dashboard:view')).toBe(true);
  });

  it('role dashboards redirect correctly', () => {
    expect(getDefaultDashboardPath('warehouse_staff')).toBe('/admin/warehouse-admin');
    expect(getDefaultDashboardPath('salesman')).toBe('/admin/sales');
    expect(getDefaultDashboardPath('delivery_driver')).toBe('/admin/delivery');
    expect(getDefaultDashboardPath('sales_manager')).toBe('/admin/reports-admin');
  });
});
