'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useQuoteCart } from '@/context/quote-cart-context';
import { QuoteSubmitForm } from '@/components/quote/QuoteSubmitForm';
import { QuoteDraftsPanel } from '@/components/quote/quote-drafts-panel';
import { RippleButton } from '@/components/ui/ripple-button';
import type { QuoteDraft } from '@/types/quote';

type Props = { drafts?: QuoteDraft[] };

export function QuoteCartContent({ drafts = [] }: Props) {
  const { items, count, updateQuantity, removeItem, clear } = useQuoteCart();
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function handleSuccess(nextReference: string) {
    setReference(nextReference);
    setShowForm(false);
    clear();
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-bold text-green-900">Quote request received</h2>
        <p className="mt-2 text-green-800">
          Thank you. Your quote reference is <strong>{reference}</strong>.
        </p>
        <p className="mt-4 text-sm text-green-700">
          Our sales team will review your products and contact you shortly.
        </p>
        <Link
          href="/account/quotes"
          className="mt-6 inline-block text-sm font-semibold text-orange-600 hover:underline"
        >
          View quote history →
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-700">No products added for quote yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:underline"
          >
            Browse products →
          </Link>
        </div>
        <QuoteDraftsPanel drafts={drafts} />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          {count} item{count !== 1 ? 's' : ''} ready to submit
        </p>
        <QuoteSubmitForm
          items={items}
          notes={notes}
          onBack={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">{count} item{count !== 1 ? 's' : ''} ready for quote</p>

      <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-600">{item.sku}</p>
              {item.price != null && (
                <p className="mt-1 text-sm text-slate-700">
                  €{item.price.toFixed(2)} / {item.unit}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="rounded border border-slate-300 p-1 text-slate-700 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-slate-900">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="rounded border border-slate-300 p-1 text-slate-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Remove item"
              onClick={() => removeItem(item.productId)}
              className="rounded p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div>
        <label htmlFor="quote-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
          Additional notes (optional)
        </label>
        <textarea
          id="quote-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Delivery requirements, specifications, quantities..."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <RippleButton type="button" onClick={() => setShowForm(true)} className="w-full sm:w-auto" variant="primary">
          Ask for quote
        </RippleButton>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Continue Browsing
        </Link>
      </div>

      <QuoteDraftsPanel drafts={drafts} notes={notes} />

      <p className="text-xs text-slate-600">
        <Link href="/account/login" className="text-orange-600 hover:underline">
          Sign in
        </Link>{' '}
        to save quote history to your account.
      </p>
    </div>
  );
}
