'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Package } from 'lucide-react';
import { TrackingTimeline } from '@/components/account/tracking-timeline';
import { findShipment, SAMPLE_SHIPMENTS } from '@/lib/tracking';
import { RippleButton } from '@/components/ui/ripple-button';

export default function TrackingPageContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order') ?? '';

  const [query, setQuery] = useState(orderParam);
  const [manualResult, setManualResult] = useState<ReturnType<typeof findShipment>>(null);
  const [searched, setSearched] = useState(false);

  const autoResult = orderParam ? findShipment(orderParam) : null;
  const result = manualResult ?? autoResult;
  const showEmpty = searched && !result;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setManualResult(findShipment(query));
    setSearched(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Delivery Tracking</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track your order by tracking number or order ID.
      </p>

      <form onSubmit={handleSearch} className="mt-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter tracking number or order ID (e.g. MT7829341056)"
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <RippleButton type="submit" className="mt-4">
          Track shipment
        </RippleButton>
      </form>

      {showEmpty && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No shipment found</p>
          <p className="mt-1 text-sm text-slate-500">
            Check your tracking number and try again.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-slate-500">
            Order <span className="font-mono font-medium text-slate-700">{result.orderId}</span>
          </p>
          <TrackingTimeline shipment={result} />
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent shipments
        </h2>
        <p className="mt-1 text-sm text-slate-500">Sample orders for demonstration.</p>
        <ul className="mt-4 space-y-3">
          {SAMPLE_SHIPMENTS.map((shipment) => (
            <li key={shipment.orderId}>
              <button
                type="button"
                onClick={() => {
                  setQuery(shipment.trackingNumber);
                  setManualResult(shipment);
                  setSearched(true);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-orange-300 hover:shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{shipment.orderId}</p>
                  <p className="text-sm text-slate-500">{shipment.carrier}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-700">{shipment.trackingNumber}</p>
                  <p className="text-xs capitalize text-orange-600">
                    {shipment.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-slate-500">
        Need help?{' '}
        <Link href="/account/tickets" className="text-orange-600 hover:underline">
          Open a support ticket
        </Link>
      </p>
    </div>
  );
}
