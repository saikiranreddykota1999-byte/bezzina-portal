'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  bulkArchiveProducts,
  bulkDeleteProducts,
  bulkPublishProducts,
  duplicateProduct,
  restoreProduct,
} from '@/actions/admin-products';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';
import {
  adminBadgeNeutralClass,
  adminBadgeSuccessClass,
  adminLinkClass,
} from '@/components/admin/admin-styles';
import { ArchiveProductButton } from '@/app/(admin)/admin/products/archive-product-button';
import { DeleteProductButton } from '@/app/(admin)/admin/products/delete-product-button';
import type { Product } from '@/types/product';

type Props = { products: Product[] };

export function ProductsTable({ products }: Props) {
  const router = useRouter();
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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
        <span className={adminBadgeNeutralClass}>
          {(p as Product & { publish_status?: string }).publish_status ?? 'published'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (p) => (
        <span className={p.is_active ? adminBadgeSuccessClass : adminBadgeNeutralClass}>
          {p.is_active ? 'Active' : 'Archived'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/products/${p.id}`} className={adminLinkClass}>Edit</Link>
          <Link href={`/products/${p.slug}`} target="_blank" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)]">Preview</Link>
          <button type="button" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)]" onClick={async () => { await duplicateProduct(p.id); router.refresh(); }}>Duplicate</button>
          {p.is_active ? (
            <ArchiveProductButton id={p.id} name={p.name} />
          ) : (
            <button type="button" className="text-[var(--admin-success)] hover:underline" onClick={async () => { await restoreProduct(p.id); router.refresh(); }}>Restore</button>
          )}
          <DeleteProductButton id={p.id} name={p.name} />
        </div>
      ),
    },
  ];

  return (
    <>
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
          label: 'Delete',
          variant: 'danger',
          onAction: (ids) => {
            setBulkDeleteIds(ids);
            setBulkDeleteOpen(true);
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

    <ConfirmDestructiveDialog
      title="Delete selected products?"
      description={`${bulkDeleteIds.length} product(s) will be soft-deleted and hidden from the storefront.`}
      requireTypedConfirm
      open={bulkDeleteOpen}
      onOpenChange={setBulkDeleteOpen}
      onConfirm={async () => {
        const result = await bulkDeleteProducts(bulkDeleteIds);
        if (!result.success) {
          throw new Error(result.error);
        }
        setBulkDeleteIds([]);
        router.refresh();
      }}
    />
    </>
  );
}
