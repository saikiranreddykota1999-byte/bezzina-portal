'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useQuoteCart } from '@/context/quote-cart-context';
import { RippleButton } from '@/components/ui/ripple-button';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function QuoteCartDrawer({ open, onClose }: Props) {
  const { items, count, updateQuantity, removeItem, clear } = useQuoteCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close quote cart"
        className="min-w-0 flex-1 bg-slate-900/40"
        onClick={onClose}
      />
      <aside className="flex h-dvh w-full max-w-md shrink-0 flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Ask for quote ({count})</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-600">No products added for quote yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    {item.image_url ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.sku}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="shrink-0 text-red-500"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="rounded border border-slate-300 p-1 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="rounded border border-slate-300 p-1"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        {item.unit ? (
                          <span className="text-xs text-slate-500">{item.unit}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t border-slate-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <RippleButton href="/quote" variant="primary" className="w-full" onClick={onClose}>
            Ask for quote
          </RippleButton>
          <Link
            href="/quote"
            onClick={onClose}
            className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Save draft / full quote page
          </Link>
          <Link
            href="/products"
            onClick={onClose}
            className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Continue Browsing
          </Link>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="w-full text-sm text-red-600 hover:underline"
            >
              Clear cart
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
