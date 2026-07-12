'use client';

import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { TrackingTimeline } from '@/components/account/tracking-timeline';
import { findShipment } from '@/lib/tracking';
import { RippleButton } from '@/components/ui/ripple-button';
import Link from 'next/link';

export function PublicTrackContent() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ReturnType<typeof findShipment>>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setResult(findShipment(query));
    setSearched(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
        Joseph Bezzina & Co. Ltd
      </p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Track your delivery</h1>
      <p className="mt-2 text-slate-600">
        Enter your tracking number or order reference to see live delivery status.
      </p>

      <form onSubmit={handleSearch} className="mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tracking number or order ID"
            className="w-full rounded-xl border border-slate-300 py-4 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
          />
        </div>
        <RippleButton type="submit" className="mt-4">
          Track
        </RippleButton>
      </form>

      {searched && !result && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-700">Shipment not found</p>
          <p className="mt-1 text-sm text-slate-500">
            Check your tracking number or order reference. For assistance, contact our team.
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
    </main>
  );
}
