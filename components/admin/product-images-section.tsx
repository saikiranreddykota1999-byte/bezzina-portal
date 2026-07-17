'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import {
  deleteProductImage,
  reorderProductImages,
  setPrimaryProductImage,
  uploadProductImage,
} from '@/actions/admin-products/media';
import type { ProductImage } from '@/types/product';
import {
  adminCardClass,
  adminFileInputClass,
  adminHeadingClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = {
  productId: string;
  images: ProductImage[];
};

export function ProductImagesSection({ productId, images }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadProductImage(productId, formData);
    if (!result.success) setError(result.error);
    else router.refresh();
    setUploading(false);
  }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = sorted.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    await reorderProductImages(productId, ids);
    router.refresh();
  }

  return (
    <section className={`${adminCardClass} p-5`}>
      <h3 className={`mb-4 text-sm ${adminHeadingClass}`}>Product Images</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((img) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(img.id)}
            className="group relative rounded-lg border border-[var(--admin-border)] p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--admin-border-light)]">
              <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <GripVertical className="h-4 w-4 text-[var(--admin-text-muted)]" />
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Set primary"
                  onClick={async () => {
                    await setPrimaryProductImage(productId, img.id);
                    router.refresh();
                  }}
                  className={`rounded p-1 ${img.is_primary ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)]'}`}
                >
                  <Star className="h-4 w-4" fill={img.is_primary ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={async () => {
                    await deleteProductImage(img.id, productId);
                    router.refresh();
                  }}
                  className="rounded p-1 text-[var(--admin-danger)] hover:bg-[var(--admin-danger-light)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {img.is_primary && (
              <span className="absolute left-3 top-3 rounded bg-[var(--admin-primary)] px-2 py-0.5 text-xs font-medium text-white">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className={`mt-4 ${adminFileInputClass}`}
      />
      {uploading && <p className={`mt-1 text-xs ${adminSubtextClass}`}>Uploading…</p>}
      {error && <p className="mt-1 text-xs text-[var(--admin-danger)]">{error}</p>}
      <p className={`mt-2 text-xs ${adminSubtextClass}`}>Drag images to reorder. Star icon sets primary image.</p>
    </section>
  );
}
