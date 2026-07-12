'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bulkDisableCustomers } from '@/actions/admin-customers';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
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
        <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {r.is_disabled ? 'Disabled' : 'Active'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <Link href={`/admin/customers/${r.id}`} className="text-orange-600 hover:underline">
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
