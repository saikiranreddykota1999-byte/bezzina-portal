'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GripVertical, Trash2 } from 'lucide-react';
import {
  deleteProduct360Frame,
  reorderProduct360Frames,
  uploadProduct360Frame,
} from '@/actions/admin-products/media';
import type { Product360Frame } from '@/types/product';
import {
  adminCardClass,
  adminFileInputClass,
  adminHeadingClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

const MIN_FRAMES = 8;

type Props = {
  productId: string;
  frames: Product360Frame[];
};

export function Product360Section({ productId, frames }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const sorted = [...frames].sort((a, b) => a.sort_order - b.sort_order);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError('');

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadProduct360Frame(productId, formData);
      if (!result.success) {
        setError(result.error);
        break;
      }
    }

    router.refresh();
    setUploading(false);
    e.target.value = '';
  }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = sorted.map((f) => f.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    await reorderProduct360Frames(productId, ids);
    router.refresh();
  }

  const frameCount = sorted.length;
  const hasEnoughFrames = frameCount >= MIN_FRAMES;

  return (
    <section className={`${adminCardClass} p-5`}>
      <h3 className={`mb-1 text-sm ${adminHeadingClass}`}>360° Spin Frames</h3>
      <p className={`mb-4 text-xs ${adminSubtextClass}`}>
        Upload sequential frames for the storefront spin viewer. At least {MIN_FRAMES} frames
        are required — currently {frameCount}.
        {!hasEnoughFrames && (
          <span className="ml-1 text-[var(--admin-warning)]">
            ({MIN_FRAMES - frameCount} more needed)
          </span>
        )}
      </p>

      {sorted.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {sorted.map((frame, index) => (
            <div
              key={frame.id}
              draggable
              onDragStart={() => setDragId(frame.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(frame.id)}
              className="group relative rounded-lg border border-[var(--admin-border)] p-1"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--admin-border-light)]">
                <Image src={frame.url} alt="" fill className="object-cover" sizes="80px" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <GripVertical className="h-3 w-3 text-[var(--admin-text-muted)]" />
                <button
                  type="button"
                  title="Delete frame"
                  onClick={async () => {
                    await deleteProduct360Frame(productId, frame.id);
                    router.refresh();
                  }}
                  className="rounded p-0.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger-light)]"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <span className="absolute left-2 top-2 rounded bg-[var(--admin-primary)] px-1 py-0.5 text-[10px] font-medium text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className={adminFileInputClass}
      />
      {uploading && <p className={`mt-1 text-xs ${adminSubtextClass}`}>Uploading…</p>}
      {error && <p className="mt-1 text-xs text-[var(--admin-danger)]">{error}</p>}
      <p className={`mt-2 text-xs ${adminSubtextClass}`}>
        Drag frames to reorder. Order determines spin sequence on the storefront.
      </p>
    </section>
  );
}
