import Link from 'next/link';
import { RippleButton } from '@/components/ui/ripple-button';

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
      <p className="mt-1 text-sm text-slate-500">View past orders, download invoices, and track shipments.</p>

      <div className="mt-8 space-y-4">
        {[
          { id: 'JB-2026-0042', date: '8 Jul 2026', status: 'Out for delivery', total: '€124.50' },
          { id: 'JB-2026-0038', date: '2 Jul 2026', status: 'Delivered', total: '€89.00' },
        ].map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"
          >
            <div>
              <p className="font-mono font-semibold text-slate-900">{order.id}</p>
              <p className="text-sm text-slate-500">{order.date}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-900">{order.total}</p>
              <p className="text-sm capitalize text-orange-600">{order.status}</p>
            </div>
            <RippleButton href={`/account/tracking?order=${encodeURIComponent(order.id)}`} variant="ghost">
              Track
            </RippleButton>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Track any shipment at{' '}
        <Link href="/track" className="text-orange-600 hover:underline">
          /track
        </Link>
      </p>
    </div>
  );
}
