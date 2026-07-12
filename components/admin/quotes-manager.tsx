'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { bulkUpdateQuoteStatus, updateQuoteRequest } from '@/actions/admin-quotes';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import { adminSelectClass } from '@/components/admin/admin-styles';
import type { QuoteStatus } from '@/types/admin';

type QuoteRow = {
  id: string;
  reference: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
};

const STATUSES: QuoteStatus[] = [
  'pending',
  'in_review',
  'waiting_customer',
  'quoted',
  'approved',
  'accepted',
  'rejected',
  'completed',
  'cancelled',
];

type Props = { quotes: QuoteRow[] };

export function QuotesManager({ quotes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const columns: Column<QuoteRow>[] = [
    { key: 'reference', header: 'Reference', sortable: true, render: (r) => r.reference },
    { key: 'customer_name', header: 'Customer', sortable: true, render: (r) => r.customer_name ?? '—' },
    { key: 'customer_email', header: 'Email', render: (r) => r.customer_email ?? '—' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => (
        <select
          value={r.status}
          disabled={pending}
          onChange={(e) => {
            startTransition(async () => {
              await updateQuoteRequest({ id: r.id, status: e.target.value as QuoteStatus });
              router.refresh();
            });
          }}
          className={adminSelectClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (r) => new Date(r.created_at).toLocaleDateString('en-GB'),
    },
  ];

  return (
    <AdminDataTable
      data={quotes}
      columns={columns}
      searchKeys={['reference', 'customer_name', 'customer_email', 'status']}
      bulkActions={[
        {
          label: 'Mark In Review',
          onAction: async (ids) => {
            await bulkUpdateQuoteStatus(ids, 'in_review');
            router.refresh();
          },
        },
        {
          label: 'Export CSV',
          onAction: (ids) => {
            const rows = quotes.filter((q) => ids.includes(q.id));
            exportToCsv(rows, [
              { key: 'reference', header: 'Reference' },
              { key: 'customer_name', header: 'Customer' },
              { key: 'customer_email', header: 'Email' },
              { key: 'status', header: 'Status' },
            ], 'quotes-export.csv');
          },
        },
      ]}
    />
  );
}
