'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bulkDisableCustomers } from '@/actions/admin-customers';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import {
  adminBadgeSuccessClass,
  adminBadgeWarningClass,
  adminLinkClass,
} from '@/components/admin/admin-styles';
import type { AdminCustomer } from '@/types/admin';

type Props = { customers: AdminCustomer[] };

export function CustomersManager({ customers }: Props) {
  const router = useRouter();

  const columns: Column<AdminCustomer>[] = [
    { key: 'full_name', header: 'Name', sortable: true, render: (r) => r.full_name ?? '—' },
    { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
    { key: 'phone', header: 'Phone', render: (r) => r.phone ?? '—' },
    { key: 'company_name', header: 'Company', render: (r) => r.company_name ?? '—' },
    {
      key: 'is_disabled',
      header: 'Status',
      render: (r) => (
        <span className={r.is_disabled ? adminBadgeWarningClass : adminBadgeSuccessClass}>
          {r.is_disabled ? 'Disabled' : 'Active'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <Link href={`/admin/customers/${r.id}`} className={adminLinkClass}>
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={customers}
      columns={columns}
      searchKeys={['full_name', 'email', 'phone', 'company_name']}
      bulkActions={[
        {
          label: 'Disable Selected',
          variant: 'danger',
          onAction: async (ids) => {
            await bulkDisableCustomers(ids);
            router.refresh();
          },
        },
        {
          label: 'Export CSV',
          onAction: (ids) => {
            const rows = customers.filter((c) => ids.includes(c.id));
            exportToCsv(rows, [
              { key: 'full_name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'phone', header: 'Phone' },
              { key: 'company_name', header: 'Company' },
            ], 'customers-export.csv');
          },
        },
      ]}
    />
  );
}
