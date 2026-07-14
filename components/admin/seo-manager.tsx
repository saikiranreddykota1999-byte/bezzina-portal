'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSeoPageAction, upsertSeoPageAction } from '@/actions/admin-seo';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';
import type { SeoPage } from '@/types/admin';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminTextareaClass,
} from '@/components/admin/admin-styles';

type Props = { pages: SeoPage[] };

export function SeoManager({ pages }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    path: '/',
    page_title: '',
    meta_description: '',
    keywords: '',
    robots: 'index,follow',
  });

  const columns: Column<SeoPage>[] = [
    { key: 'path', header: 'Path', sortable: true, render: (r) => r.path },
    { key: 'page_title', header: 'Title', sortable: true, render: (r) => r.page_title },
    { key: 'robots', header: 'Robots', render: (r) => r.robots ?? '—' },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <ConfirmDestructiveDialog
          title="Delete SEO page?"
          description={`Remove SEO settings for ${r.path}.`}
          onConfirm={async () => {
            await deleteSeoPageAction(r.id);
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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertSeoPageAction(form);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className={`${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Add / Update SEO Page</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className={adminInputClass} placeholder="Path e.g. /products" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} required />
          <input className={adminInputClass} placeholder="Page title" value={form.page_title} onChange={(e) => setForm({ ...form, page_title: e.target.value })} required />
          <textarea className={`${adminTextareaClass} sm:col-span-2`} placeholder="Meta description" rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          <input className={adminInputClass} placeholder="Keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          <input className={adminInputClass} placeholder="Robots" value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })} />
        </div>
        <button type="submit" disabled={pending} className={`mt-4 ${adminButtonPrimaryClass}`}>
          Save SEO Page
        </button>
      </form>

      <AdminDataTable data={pages} columns={columns} searchKeys={['path', 'page_title']} />
    </div>
  );
}
