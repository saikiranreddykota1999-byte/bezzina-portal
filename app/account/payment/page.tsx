'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useCards } from '@/context/cards-context';
import { RippleButton } from '@/components/ui/ripple-button';

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { cards, defaultCard } = useCards();
  const [selectedCardId, setSelectedCardId] = useState(defaultCard?.id ?? '');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  const shipping = items.length > 0 ? 12.5 : 0;
  const total = subtotal + shipping;

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? defaultCard;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedCard) return;

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setOrderId(`JB-2026-${String(Math.floor(1000 + Math.random() * 9000))}`);
    setProcessing(false);
    setSuccess(true);
    clearCart();
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
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-2 text-slate-500">
          Order <span className="font-mono font-medium">{orderId}</span> has been placed.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <RippleButton href="/account/tracking">Track delivery</RippleButton>
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

      <form onSubmit={handlePay} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-slate-900">
              <MapPin className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold">Delivery address</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              5/6 Triq Aldo Moro, Il-Marsa MRS 9065, Malta
            </p>
            <Link href="/account/addresses" className="mt-2 inline-block text-sm text-orange-600 hover:underline">
              Change address
            </Link>
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
                <dt className="text-slate-500">Shipping</dt>
                <dd>€{shipping.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{subtotal > 0 ? `€${total.toFixed(2)}` : `€${shipping.toFixed(2)}`}</dd>
              </div>
            </dl>

            <RippleButton
              type="submit"
              className="mt-6 w-full"
              variant="primary"
            >
              {processing ? 'Processing...' : `Pay ${subtotal > 0 ? `€${total.toFixed(2)}` : 'now'}`}
            </RippleButton>

            {cards.length === 0 && (
              <p className="mt-2 text-center text-xs text-red-600">
                <Link href="/account/cards" className="underline">Add a card</Link> to continue
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push('/account/cart')}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-900"
            >
              Back to cart
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
