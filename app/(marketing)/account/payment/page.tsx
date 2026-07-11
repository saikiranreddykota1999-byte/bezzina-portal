'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, ShieldCheck, Store } from 'lucide-react';
import { placeOrderAction } from '@/actions/pickup';
import { useCart } from '@/context/cart-context';
import { useCards } from '@/context/cards-context';
import { useCheckout } from '@/context/checkout-context';
import { DemoModeBanner } from '@/components/account/demo-mode-banner';
import { isDemoMode } from '@/config/demo';
import { company } from '@/config/company';
import { calculateOrderTotals, formatPickupDateTime } from '@/lib/checkout';
import { RippleButton } from '@/components/ui/ripple-button';

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { cards, defaultCard } = useCards();
  const { fulfillmentMethod, pickup, clearCheckout } = useCheckout();
  const [selectedCardId, setSelectedCardId] = useState(defaultCard?.id ?? '');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  const { shipping, total } = calculateOrderTotals(subtotal, fulfillmentMethod, items.length);
  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? defaultCard;
  const isPickup = fulfillmentMethod === 'store_pickup';

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedCard) return;
    if (isPickup && !pickup) {
      setError('Complete store pickup details on checkout before paying.');
      return;
    }

    setProcessing(true);
    setError('');

    const orderPayload =
      fulfillmentMethod === 'store_pickup' && pickup
        ? {
            fulfillmentMethod: 'store_pickup' as const,
            pickup,
            items: items.map((item) => ({
              productId: item.productId,
              slug: item.slug,
              name: item.name,
              sku: item.sku,
              price: item.price,
              unit: item.unit,
              quantity: item.quantity,
            })),
          }
        : {
            fulfillmentMethod: 'delivery' as const,
            items: items.map((item) => ({
              productId: item.productId,
              slug: item.slug,
              name: item.name,
              sku: item.sku,
              price: item.price,
              unit: item.unit,
              quantity: item.quantity,
            })),
          };

    const result = await placeOrderAction(orderPayload);

    if (!result.success) {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setOrderNumber(`JB-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
        setPickupCode(isPickup ? `PKP-DEMO${String(Math.floor(100 + Math.random() * 900))}` : '');
        setProcessing(false);
        setSuccess(true);
        clearCart();
        clearCheckout();
        return;
      }

      setError(result.error ?? 'Unable to place order');
      setProcessing(false);
      return;
    }

    setOrderNumber(result.orderNumber ?? '');
    setPickupCode(result.pickupCode ?? '');
    setProcessing(false);
    setSuccess(true);
    clearCart();
    clearCheckout();
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          {isDemoMode ? 'Demo payment complete' : 'Payment successful'}
        </h1>
        <p className="mt-2 text-slate-500">
          Order <span className="font-mono font-medium">{orderNumber}</span>
          {isDemoMode ? ' — simulated for demonstration.' : ' has been placed.'}
        </p>

        {isPickup && pickupCode && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
              Your pickup code
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900">{pickupCode}</p>
            {pickup && (
              <p className="mt-3 text-sm text-slate-600">
                {formatPickupDateTime(pickup.pickupDate, pickup.pickupTime)}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-600">
              A confirmation email has been queued with your pickup instructions.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isPickup ? (
            <RippleButton href="/account/orders">View pickup status</RippleButton>
          ) : (
            <RippleButton href="/account/tracking">Track delivery</RippleButton>
          )}
          <RippleButton href="/account/orders" variant="ghost">
            View orders
          </RippleButton>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
        <p className="mt-8 text-slate-500">Your cart is empty.</p>
        <RippleButton href="/products" className="mt-6">
          Browse products
        </RippleButton>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
      <p className="mt-1 text-sm text-slate-500">Review your order and complete payment securely.</p>

      <div className="mt-6">
        <DemoModeBanner />
      </div>

      <form onSubmit={handlePay} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-slate-900">
              {isPickup ? (
                <Store className="h-5 w-5 text-orange-500" />
              ) : (
                <MapPin className="h-5 w-5 text-orange-500" />
              )}
              <h2 className="font-semibold">
                {isPickup ? 'Store pickup' : 'Delivery address'}
              </h2>
            </div>

            {isPickup && pickup ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  Scheduled for {formatPickupDateTime(pickup.pickupDate, pickup.pickupTime)}
                </p>
                <Link href="/account/checkout" className="text-sm text-orange-600 hover:underline">
                  Change pickup details
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm text-slate-600">
                  {company.address.line1}, {company.address.city} {company.address.postalCode},{' '}
                  {company.address.country}
                </p>
                <Link
                  href="/account/addresses"
                  className="mt-2 inline-block text-sm text-orange-600 hover:underline"
                >
                  Change address
                </Link>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold">Payment method</h2>
              </div>
              <Link href="/account/cards" className="text-sm text-orange-600 hover:underline">
                Add card
              </Link>
            </div>

            {cards.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">No saved cards.</p>
                <RippleButton href="/account/cards" className="mt-4" variant="ghost">
                  Add a card
                </RippleButton>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {cards.map((card) => (
                  <li key={card.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        selectedCardId === card.id
                          ? 'border-orange-400 bg-orange-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="card"
                        value={card.id}
                        checked={selectedCardId === card.id}
                        onChange={() => setSelectedCardId(card.id)}
                        className="text-orange-500"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          •••• •••• •••• {card.last4}
                        </p>
                        <p className="text-sm text-slate-500">{card.cardholderName}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Order summary</h2>
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm text-slate-600">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.quantity}× {item.name}
                  </span>
                  {item.price != null && (
                    <span className="shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>{subtotal > 0 ? `€${subtotal.toFixed(2)}` : 'Quote on request'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">
                  {isPickup ? 'Pickup fee' : 'Shipping'}
                </dt>
                <dd>{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{subtotal > 0 ? `€${total.toFixed(2)}` : `€${shipping.toFixed(2)}`}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <RippleButton type="submit" className="mt-6 w-full" variant="primary">
              {processing
                ? 'Processing...'
                : isDemoMode
                  ? `Simulate payment ${subtotal > 0 ? `(€${total.toFixed(2)})` : ''}`
                  : `Pay ${subtotal > 0 ? `€${total.toFixed(2)}` : 'now'}`}
            </RippleButton>

            {cards.length === 0 && (
              <p className="mt-2 text-center text-xs text-red-600">
                <Link href="/account/cards" className="underline">
                  Add a card
                </Link>{' '}
                to continue
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push('/account/checkout')}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-900"
            >
              Back to checkout
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
