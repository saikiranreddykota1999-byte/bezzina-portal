'use client';

import { motion } from 'framer-motion';
import { Check, Circle, Package, Truck } from 'lucide-react';
import type { Shipment } from '@/types/payment';

const STATUS_ICONS: Record<string, typeof Package> = {
  order_placed: Package,
  confirmed: Check,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: Check,
};

type Props = {
  shipment: Shipment;
};

export function TrackingTimeline({ shipment }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Tracking number</p>
          <p className="font-mono text-lg font-semibold text-slate-900">{shipment.trackingNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Carrier</p>
          <p className="font-medium text-slate-900">{shipment.carrier}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Estimated delivery</p>
        <p className="font-semibold text-slate-900">
          {shipment.estimatedDelivery === 'TBD'
            ? 'To be confirmed'
            : new Date(shipment.estimatedDelivery).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
        </p>
      </div>

      <ol className="relative space-y-0">
        {shipment.events.map((event, i) => {
          const Icon = STATUS_ICONS[event.status] ?? Circle;
          const isLast = i === shipment.events.length - 1;

          return (
            <motion.li
              key={event.status}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${event.completed ? 'bg-orange-400' : 'bg-slate-200'}`}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  event.completed
                    ? 'bg-orange-700 text-white'
                    : 'border-2 border-slate-200 bg-white text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={`font-medium ${event.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                  {event.label}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{event.description}</p>
                {event.timestamp && (
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(event.timestamp).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">Items in this shipment</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {shipment.items.map((item) => (
            <li key={item.name}>
              {item.quantity}× {item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
