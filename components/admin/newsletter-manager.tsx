'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { bulkDeleteSubscribersAction, deleteNewsletterSubscriberAction } from '@/actions/admin-newsletter';
import { AdminDataTable, exportToCsv, type Column } from '@/components/admin/admin-data-table';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';
import type { NewsletterSubscriber } from '@/types/admin';

type Props = { subscribers: NewsletterSubscriber[] };

export function NewsletterManager({ subscribers }: Props) {
  const router = useRouter();
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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
        <ConfirmDestructiveDialog
          title="Delete subscriber?"
          description={`Remove ${r.email} from the newsletter list permanently.`}
          onConfirm={async () => {
            await deleteNewsletterSubscriberAction(r.id);
            router.refresh();
          }}
        >
          {(open) => (
            <button type="button" className="text-sm text-[var(--admin-danger)]" onClick={open}>
              Delete
            </button>
          )}
        </ConfirmDestructiveDialog>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable
        data={subscribers}
        columns={columns}
        searchKeys={['email']}
        bulkActions={[
          {
            label: 'Bulk Delete',
            variant: 'danger',
            onAction: (ids) => {
              setBulkDeleteIds(ids);
              setBulkDeleteOpen(true);
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

      <ConfirmDestructiveDialog
        title="Delete selected subscribers?"
        description={`${bulkDeleteIds.length} subscriber(s) will be permanently removed.`}
        requireTypedConfirm
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={async () => {
          await bulkDeleteSubscribersAction(bulkDeleteIds);
          setBulkDeleteIds([]);
          router.refresh();
        }}
      />
    </>
  );
}
