'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSeoPageAction, upsertSeoPageAction } from '@/actions/admin-seo';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';
import type { SeoPage } from '@/types/admin';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

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
        <button
          type="button"
          className="text-sm text-red-600"
          onClick={() => {
            startTransition(async () => {
              await deleteSeoPageAction(r.id);
              router.refresh();
            });
          }}
        >
          Delete
        </button>
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
      <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Add / Update SEO Page</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className={inputClass} placeholder="Path e.g. /products" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} required />
          <input className={inputClass} placeholder="Page title" value={form.page_title} onChange={(e) => setForm({ ...form, page_title: e.target.value })} required />
          <textarea className={`${inputClass} sm:col-span-2`} placeholder="Meta description" rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          <input className={inputClass} placeholder="Keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          <input className={inputClass} placeholder="Robots" value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })} />
        </div>
        <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
          Save SEO Page
        </button>
      </form>

      <AdminDataTable data={pages} columns={columns} searchKeys={['path', 'page_title']} />
    </div>
  );
}
