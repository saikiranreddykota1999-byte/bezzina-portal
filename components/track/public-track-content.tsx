'use client';

import { useState, useTransition } from 'react';
import { Search, Package } from 'lucide-react';
import { TrackingTimeline } from '@/components/account/tracking-timeline';
import { trackPublicShipmentAction } from '@/actions/tracking';
import { RippleButton } from '@/components/ui/ripple-button';
import Link from 'next/link';
import type { Shipment } from '@/types/payment';

export function PublicTrackContent() {
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<Shipment | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSearched(true);
    startTransition(async () => {
      const response = await trackPublicShipmentAction({ query, email });
      if (!response.success) {
        setResult(null);
        setError(response.error);
        return;
      }
      setResult(response.data ?? null);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
        Joseph Bezzina & Co. Ltd
      </p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Track your delivery</h1>
      <p className="mt-2 text-slate-600">
        Enter your order reference and the email address used on the order to view delivery status.
      </p>

      <form onSubmit={handleSearch} className="mt-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tracking number or order ID"
            aria-label="Tracking number or order ID"
            required
            className="w-full rounded-xl border border-slate-300 py-4 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
          />
        </div>
        <div>
          <label htmlFor="track-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Order email
          </label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
          />
        </div>
        <RippleButton type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Searching…' : 'Track'}
        </RippleButton>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {searched && !error && !result && !isPending && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-700">Shipment not found</p>
          <p className="mt-1 text-sm text-slate-500">
            Check the order reference and email. For assistance, contact our team.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-[#0B3D91] hover:underline"
          >
            Contact us
          </Link>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <TrackingTimeline shipment={result} />
        </div>
      )}

      <p className="mt-10 text-center text-sm text-slate-500">
        <Link href="/account/login" className="font-semibold text-[#0B3D91] hover:underline">
          Sign in
        </Link>{' '}
        to view all your orders.
      </p>
    </div>
  );
}
