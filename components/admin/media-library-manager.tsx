'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { bulkDeleteMediaAction, deleteMediaAssetAction, uploadMediaAssetAction } from '@/actions/admin-media';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';
import type { MediaAsset } from '@/types/admin';
import {
  adminCardClass,
  adminFileInputClass,
  adminLinkClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = { assets: MediaAsset[] };

export function MediaLibraryManager({ assets }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const columns: Column<MediaAsset>[] = [
    { key: 'file_name', header: 'File', sortable: true, render: (r) => r.file_name },
    { key: 'folder', header: 'Folder', sortable: true, render: (r) => r.folder },
    { key: 'mime_type', header: 'Type', render: (r) => r.mime_type },
    {
      key: 'url',
      header: 'Preview',
      render: (r) =>
        r.mime_type.startsWith('image/') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.url} alt={r.alt_text ?? r.file_name} className="h-10 w-10 rounded object-cover" />
        ) : (
          <a href={r.url} target="_blank" rel="noreferrer" className={adminLinkClass}>
            Open
          </a>
        ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="text-sm text-[var(--admin-danger)]"
          onClick={() => {
            startTransition(async () => {
              await deleteMediaAssetAction(r.id);
              router.refresh();
            });
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'general');
    startTransition(async () => {
      await uploadMediaAssetAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className={`${adminCardClass} border-dashed p-8 text-center`}>
        <p className={adminSubtextClass}>Drag & drop or choose files to upload</p>
        <input type="file" onChange={handleUpload} disabled={pending} className={`mt-4 ${adminFileInputClass}`} />
      </div>

      <AdminDataTable
        data={assets}
        columns={columns}
        searchKeys={['file_name', 'folder', 'mime_type']}
        bulkActions={[
          {
            label: 'Bulk Delete',
            variant: 'danger',
            onAction: async (ids) => {
              await bulkDeleteMediaAction(ids);
              router.refresh();
            },
          },
        ]}
      />
    </div>
  );
}
