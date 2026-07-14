import { guardAdminPage } from '@/lib/admin/guard-page';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { createClient } from '@/lib/supabase/server';
import { listLowStockLevels } from '@/services/inventory.service';
import { adminCardClass } from '@/components/admin/admin-styles';

export const metadata = { title: 'Inventory | Admin' };

export default async function InventoryPage() {
  await guardAdminPage('inventory:view');
  const supabase = await createClient();
  const lowStock = await listLowStockLevels(supabase, 30);

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Stock levels, reservations, and low-stock alerts across warehouses."
      />

      <section className={`${adminCardClass} p-5`}>
        <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Low Stock Alerts</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lowStock.length === 0 ? (
            <li className="text-[var(--admin-text-muted)]">No low stock alerts.</li>
          ) : (
            lowStock.map((level) => (
              <li key={level.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>
                  {level.variant?.name ?? level.product?.name ?? 'SKU'} ({level.variant?.sku ?? level.product?.sku})
                </span>
                <span>
                  Available {level.available_stock} / Min {level.min_stock}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
