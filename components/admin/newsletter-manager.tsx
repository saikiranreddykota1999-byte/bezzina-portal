'use client';

import { useRouter } from 'next/navigation';
import { bulkDeleteSubscribersAction, deleteNewsletterSubscriberAction } from '@/actions/admin-newsletter';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import type { NewsletterSubscriber } from '@/types/admin';

type Props = { subscribers: NewsletterSubscriber[] };

export function NewsletterManager({ subscribers }: Props) {
  const router = useRouter();

  const columns: Column<NewsletterSubscriber>[] = [
    { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
    {
      key: 'is_active',
      header: 'Status',
      render: (r) => (r.is_active ? 'Active' : 'Unsubscribed'),
    },
    {
      key: 'subscribed_at',
      header: 'Subscribed',
      sortable: true,
      render: (r) => new Date(r.subscribed_at).toLocaleDateString('en-GB'),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="text-sm text-[var(--admin-danger)]"
          onClick={async () => {
            await deleteNewsletterSubscriberAction(r.id);
            router.refresh();
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={subscribers}
      columns={columns}
      searchKeys={['email']}
      bulkActions={[
        {
          label: 'Bulk Delete',
          variant: 'danger',
          onAction: async (ids) => {
            await bulkDeleteSubscribersAction(ids);
            router.refresh();
          },
        },
        {
          label: 'Export CSV',
          onAction: (ids) => {
            const rows = subscribers.filter((s) => ids.includes(s.id));
            exportToCsv(rows, [{ key: 'email', header: 'Email' }], 'newsletter-subscribers.csv');
          },
        },
      ]}
    />
  );
}
