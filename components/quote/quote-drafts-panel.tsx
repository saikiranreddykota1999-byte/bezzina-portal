'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Trash2 } from 'lucide-react';
import { useQuoteCart } from '@/context/quote-cart-context';
import { deleteQuoteDraft, saveQuoteDraft } from '@/actions/quote-drafts';
import type { QuoteDraft } from '@/types/quote';

type Props = {
  drafts: QuoteDraft[];
  notes?: string;
  onDraftLoaded?: () => void;
};

export function QuoteDraftsPanel({ drafts: initialDrafts, notes = '', onDraftLoaded }: Props) {
  const router = useRouter();
  const { items, replaceItems } = useQuoteCart();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [draftName, setDraftName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSaveDraft() {
    if (items.length === 0) {
      setError('Add products to your quote cart before saving.');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = await saveQuoteDraft({
        name: draftName.trim() || `Draft ${new Date().toLocaleDateString('en-GB')}`,
        items,
        notes: notes.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage('Quote draft saved to your account.');
      setDraftName('');
      router.refresh();
    });
  }

  function handleLoadDraft(draft: QuoteDraft) {
    replaceItems(draft.items);
    setMessage(`Loaded "${draft.name}" into your quote cart.`);
    onDraftLoaded?.();
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteQuoteDraft(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-slate-900">Saved Quote Drafts</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Save your current cart and resume later.{' '}
        <Link href="/account/login" className="text-orange-600 hover:underline">Sign in</Link> required.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Draft name (optional)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={pending || items.length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save Draft
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {drafts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {drafts.map((draft) => (
            <li key={draft.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">{draft.name}</p>
                <p className="text-xs text-slate-500">
                  {draft.items.length} item{draft.items.length !== 1 ? 's' : ''} ·{' '}
                  {new Date(draft.updated_at).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadDraft(draft)}
                  className="text-orange-600 hover:underline"
                >
                  Load
                </button>
                <button type="button" onClick={() => handleDelete(draft.id)} className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
