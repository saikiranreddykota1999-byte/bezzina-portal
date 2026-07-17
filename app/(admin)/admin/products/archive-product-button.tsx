'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { archiveProduct } from '@/actions/admin-products/crud';

export function ArchiveProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Archive "${name}"? It will be hidden from the public catalogue.`)) return;
          setError('');
          startTransition(async () => {
            const result = await archiveProduct(id);
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="text-[var(--admin-warning)] hover:underline disabled:opacity-50"
      >
        {pending ? 'Archiving…' : 'Archive'}
      </button>
      {error ? <span className="mt-1 text-xs text-[var(--admin-danger)]">{error}</span> : null}
    </span>
  );
}
