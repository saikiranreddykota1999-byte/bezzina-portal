'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/actions/admin-products';

type Props = {
  id: string;
  name: string;
  redirectTo?: string;
  className?: string;
};

export function DeleteProductButton({
  id,
  name,
  redirectTo,
  className = 'text-[var(--admin-danger)] hover:underline disabled:opacity-50',
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleDelete() {
    const confirmed = confirm(
      `Permanently delete "${name}"?\n\nThis cannot be undone. Images, documents, and variants will also be removed.`,
    );
    if (!confirmed) return;

    setError('');
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.success) {
        setError(result.error);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" disabled={pending} onClick={handleDelete} className={className}>
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error ? <span className="mt-1 text-xs text-[var(--admin-danger)]">{error}</span> : null}
    </span>
  );
}
