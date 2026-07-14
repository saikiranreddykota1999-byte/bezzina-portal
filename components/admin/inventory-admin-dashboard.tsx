import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { createClient } from '@/lib/supabase/server';
import { listLowStockLevels } from '@/services/inventory.service';
import { adminCardClass } from '@/components/admin/admin-styles';
import Link from 'next/link';

export async function InventoryAdminDashboard() {
  const supabase = await createClient();
  const lowStock = await listLowStockLevels(supabase, 50);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Inventory Admin"
        description="Stock on hand, reservations, incoming quantities, and warehouse bin locations."
        actions={
          <Link href="/admin/products" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Manage Products
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${adminCardClass} p-5`}>
          <p className="text-sm text-[var(--admin-text-muted)]">Low stock SKUs</p>
          <p className="mt-2 text-3xl font-bold text-[var(--admin-navy)]">{lowStock.length}</p>
        </div>
        <div className={`${adminCardClass} p-5`}>
          <p className="text-sm text-[var(--admin-text-muted)]">Warehouses</p>
          <p className="mt-2 text-3xl font-bold text-[var(--admin-navy)]">Multi-zone</p>
        </div>
        <div className={`${adminCardClass} p-5`}>
          <p className="text-sm text-[var(--admin-text-muted)]">Location model</p>
          <p className="mt-2 text-lg font-semibold text-[var(--admin-navy)]">Zone · Rack · Shelf · Bin</p>
        </div>
      </div>

      <section className={`${adminCardClass} p-5`}>
        <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Low Stock Alerts</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lowStock.length === 0 ? (
            <li className="text-[var(--admin-text-muted)]">No low stock alerts.</li>
          ) : (
            lowStock.map((level) => (
              <li key={level.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span>
                  {level.variant?.name ?? level.product?.name ?? 'SKU'} ({level.variant?.sku ?? level.product?.sku})
                </span>
                <span className="font-mono text-xs">
                  Available {level.available_stock} · Reserved {level.reserved_stock} · Min {level.min_stock}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
