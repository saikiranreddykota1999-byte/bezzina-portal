'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { lookupBarcodeAction, createWalkInOrderAction, approveWalkInOrderAction } from '@/actions/oms-salesman';
import { getOmsOrdersAction } from '@/actions/oms-orders';
import { BarcodeScanner } from '@/components/oms/barcode-scanner';
import { OrderStatusBadge } from '@/components/oms/order-status-badge';
import { useOmsRealtime } from '@/hooks/use-oms-realtime';
import type { BarcodeLookupResult, OmsOrder } from '@/types/oms';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminInputClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type CartLine = BarcodeLookupResult & { quantity: number };

export function SalesmanPortal() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lookup, setLookup] = useState<BarcodeLookupResult | null>(null);
  const [orders, setOrders] = useState<OmsOrder[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    const result = await getOmsOrdersAction({ orderSource: 'walk_in', pageSize: 20 });
    if (result.success) setOrders(result.data?.orders ?? []);
  }, []);

  useOmsRealtime({ onOrderUpdate: loadOrders });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const result = await getOmsOrdersAction({ orderSource: 'walk_in', pageSize: 20 });
      if (cancelled) return;
      if (result.success) setOrders(result.data?.orders ?? []);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleScan(barcode: string) {
    setError('');
    const result = await lookupBarcodeAction({ barcode });
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (!result.data) {
      setError('Product not found');
      return;
    }
    setLookup(result.data);
    setCart((prev) => {
      const existing = prev.find((line) => line.id === result.data!.id);
      if (existing) {
        return prev.map((line) =>
          line.id === result.data!.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { ...result.data!, quantity: 1 }];
    });
  }

  async function createOrder() {
    if (!customerName.trim() || cart.length === 0) {
      setError('Customer name and at least one product are required.');
      return;
    }

    const result = await createWalkInOrderAction({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: cart.map((line) => ({
        productId: line.productId,
        variantId: line.type === 'variant' ? line.id : null,
        sku: line.sku,
        name: line.name,
        quantity: line.quantity,
        unitPrice: line.price,
      })),
    });

    if (!result.success) {
      setError(result.error ?? 'Failed to create order');
      return;
    }

    setMessage(`Walk-in order ${result.data?.orderNumber} created.`);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    await loadOrders();
  }

  async function approve(orderId: string) {
    const result = await approveWalkInOrderAction(orderId);
    if (!result.success) setError(result.error ?? 'Approval failed');
    else await loadOrders();
  }

  return (
    <div className="space-y-6">
      <section className={`${adminCardClass} p-5`}>
        <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Walk-in Order</h2>
        <p className={`mt-1 ${adminSubtextClass}`}>Scan barcode, build cart, and create a store order.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name"
            aria-label="Customer name"
            aria-invalid={error ? true : undefined}
            className={adminInputClass}
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone (optional)"
            aria-label="Phone (optional)"
            className={adminInputClass}
          />
        </div>

        <div className="mt-4">
          <BarcodeScanner onScan={handleScan} />
        </div>

        {lookup && (
          <p className="mt-3 text-sm text-[var(--admin-text)]">
            Last scan: {lookup.name} ({lookup.sku})
          </p>
        )}

        {cart.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((line) => (
              <li key={line.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{line.name} × {line.quantity}</span>
                <span className="font-mono text-xs">{line.sku}</span>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className={`${adminButtonPrimaryClass} mt-4`} onClick={createOrder}>
          Create Walk-in Order
        </button>
      </section>

      <section className={`${adminCardClass} p-5`}>
        <h2 className="text-lg font-semibold text-[var(--admin-navy)]">My Walk-in Orders</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-[var(--admin-navy)] hover:underline">
                  {order.order_number}
                </Link>
                <p className="text-sm text-[var(--admin-text-muted)]">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.oms_status} />
                {order.oms_status === 'draft' && (
                  <button type="button" className={adminButtonPrimaryClass} onClick={() => approve(order.id)}>
                    Approve
                  </button>
                )}
                <Link href={`/account/orders/${order.order_number}/receipt`} className="text-sm font-medium text-[var(--admin-accent)]">
                  Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {message && <p className="text-sm text-green-700" role="status">{message}</p>}
      {error && (
        <p className="text-sm text-[var(--admin-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
