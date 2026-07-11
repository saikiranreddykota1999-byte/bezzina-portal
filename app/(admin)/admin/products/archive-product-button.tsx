'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { archiveProduct } from '@/actions/admin-products';

export function ArchiveProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Archive this product?')) return;
        startTransition(async () => {
          await archiveProduct(id);
          router.refresh();
        });
      }}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      Archive
    </button>
  );
}
