'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Trash2, Minus, Plus } from 'lucide-react';
import { useQuoteCart } from '@/context/quote-cart-context';
import { submitQuoteRequest } from '@/actions/quotes';
import { buildMultiQuoteMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { RippleButton } from '@/components/ui/ripple-button';

export function QuoteCartContent() {
  const { items, count, updateQuantity, removeItem, clear } = useQuoteCart();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState('');

  const whatsappHref = buildWhatsAppUrl(
    buildMultiQuoteMessage(
      items.map((i) => ({ name: i.name, sku: i.sku, quantity: i.quantity })),
    ),
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    const result = await submitQuoteRequest(items, notes, 'web');
    if (result.success && result.data) {
      setReference(result.data.reference);
      clear();
    } else {
      setError(result.success ? '' : result.error);
    }
    setSubmitting(false);
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-bold text-green-900">Quote Submitted</h2>
        <p className="mt-2 text-green-800">
          Reference: <strong>{reference}</strong>
        </p>
        <p className="mt-4 text-sm text-green-700">
          Our sales team will review your request and respond shortly.
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-700">Your quote cart is empty.</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:underline"
        >
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">{count} item{count !== 1 ? 's' : ''} in quote cart</p>

      <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-600">{item.sku}</p>
              {item.price != null && (
                <p className="mt-1 text-sm text-slate-700">€{item.price.toFixed(2)} / {item.unit}</p>
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
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Delivery requirements, specifications, quantities..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <RippleButton
          type="button"
          onClick={handleSubmit}
          className="flex-1"
          variant="primary"
        >
          {submitting ? 'Submitting…' : 'Submit Quote Request'}
        </RippleButton>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1da851]"
        >
          <MessageCircle className="h-4 w-4" />
          Send via WhatsApp
        </a>
      </div>

      <p className="text-xs text-slate-600">
        <Link href="/account/login" className="text-orange-600 hover:underline">
          Sign in
        </Link>{' '}
        to save quote history to your account.
      </p>
    </div>
  );
}
