'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  bulkArchiveProducts,
  bulkPublishProducts,
  duplicateProduct,
  restoreProduct,
} from '@/actions/admin-products';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import type { Product } from '@/types/product';
import { ArchiveProductButton } from '@/app/(admin)/admin/products/archive-product-button';

type Props = { products: Product[] };

export function ProductsTable({ products }: Props) {
  const router = useRouter();

  const columns: Column<Product>[] = [
    { key: 'sku', header: 'SKU', sortable: true, render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (p) => p.name },
    { key: 'category', header: 'Category', render: (p) => p.category?.name ?? '—' },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (p) => (p.price != null ? `€${p.price.toFixed(2)}` : 'Quote'),
    },
    {
      key: 'publish_status',
      header: 'Publish',
      render: (p) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">
          {(p as Product & { publish_status?: string }).publish_status ?? 'published'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (p) => (
        <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
          {p.is_active ? 'Active' : 'Archived'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/products/${p.id}`} className="text-orange-600 hover:underline">Edit</Link>
          <Link href={`/products/${p.slug}`} target="_blank" className="text-slate-600 hover:underline">Preview</Link>
          <button type="button" className="text-slate-600 hover:underline" onClick={async () => { await duplicateProduct(p.id); router.refresh(); }}>Duplicate</button>
          {p.is_active ? <ArchiveProductButton id={p.id} /> : (
            <button type="button" className="text-green-600 hover:underline" onClick={async () => { await restoreProduct(p.id); router.refresh(); }}>Restore</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={products}
      columns={columns}
      searchKeys={['sku', 'name']}
      pageSize={15}
      bulkActions={[
        {
          label: 'Bulk Publish',
          onAction: async (ids) => {
            await bulkPublishProducts(ids);
            router.refresh();
          },
        },
        {
          label: 'Bulk Archive',
          variant: 'danger',
          onAction: async (ids) => {
            await bulkArchiveProducts(ids);
            router.refresh();
          },
        },
        {
          label: 'Export CSV',
          onAction: (ids) => {
            const rows = products.filter((p) => ids.includes(p.id));
            exportToCsv(
              rows as unknown as Record<string, unknown>[],
              [
                { key: 'sku', header: 'SKU' },
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug' },
              ],
              'products-export.csv',
            );
          },
        },
      ]}
    />
  );
}
