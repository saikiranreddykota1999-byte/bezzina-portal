'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Package } from 'lucide-react';
import { TrackingTimeline } from '@/components/account/tracking-timeline';
import {
  listAccountShipmentsAction,
  trackAccountShipmentAction,
} from '@/actions/tracking';
import { RippleButton } from '@/components/ui/ripple-button';
import type { Shipment } from '@/types/payment';

type Props = {
  initialOrder?: string;
};

export default function TrackingPageContent({ initialOrder = '' }: Props) {
  const [query, setQuery] = useState(initialOrder);
  const [result, setResult] = useState<Shipment | null>(null);
  const [recent, setRecent] = useState<Shipment[]>([]);
  const [searched, setSearched] = useState(Boolean(initialOrder));
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const list = await listAccountShipmentsAction();
      if (list.success) {
        setRecent(list.data ?? []);
      }

      if (initialOrder) {
        const tracked = await trackAccountShipmentAction(initialOrder);
        if (tracked.success) {
          setResult(tracked.data ?? null);
        } else {
          setError(tracked.error);
        }
      }
    });
  }, [initialOrder]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSearched(true);
    startTransition(async () => {
      const response = await trackAccountShipmentAction(query);
      if (!response.success) {
        setResult(null);
        setError(response.error);
        return;
      }
      setResult(response.data ?? null);
    });
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
            placeholder="Enter tracking number or order ID"
            aria-label="Enter tracking number or order ID"
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <RippleButton type="submit" className="mt-4" disabled={isPending}>
          {isPending ? 'Searching…' : 'Track shipment'}
        </RippleButton>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {searched && !error && !result && !isPending && (
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
          Your recent orders
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No recent orders to track yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((shipment) => (
              <li key={shipment.orderId}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(shipment.trackingNumber);
                    setResult(shipment);
                    setSearched(true);
                    setError('');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-orange-300 hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{shipment.orderId}</p>
                    <p className="text-sm text-slate-500">{shipment.carrier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-slate-700">{shipment.trackingNumber}</p>
                    <p className="text-xs capitalize text-orange-800">
                      {shipment.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-slate-500">
        Need help?{' '}
        <Link href="/account/tickets" className="text-orange-800 hover:underline">
          Open a support ticket
        </Link>
      </p>
    </div>
  );
}
