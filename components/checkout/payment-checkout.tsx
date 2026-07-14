'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, ShieldCheck, Store } from 'lucide-react';
import { createPaymentIntentAction } from '@/actions/stripe-payment';
import { placeOrderAction } from '@/actions/pickup';
import { useCart } from '@/context/cart-context';
import { useCards } from '@/context/cards-context';
import { useCheckout } from '@/context/checkout-context';
import { DemoModeBanner } from '@/components/account/demo-mode-banner';
import {
  getCardLast4,
  InlinePaymentForm,
} from '@/components/checkout/inline-payment-form';
import { StripePaymentSection } from '@/components/checkout/stripe-payment-form';
import {
  PaymentMethodSelector,
  type CheckoutPaymentMode,
} from '@/components/checkout/payment-method-selector';
import { calculateOrderTotals, formatPickupDateTime } from '@/lib/checkout';
import { formatPrice, resolveQuoteLinePrice } from '@/lib/pricing';
import { isStripeClientEnabled } from '@/lib/stripe/client';
import { RippleButton } from '@/components/ui/ripple-button';
import type { PlaceOrderInput } from '@/lib/validators/pickup';

export function PaymentCheckout() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { cards, defaultCard } = useCards();
  const { fulfillmentMethod, pickup, deliveryAddress, clearCheckout } = useCheckout();
  const [selectedCardId, setSelectedCardId] = useState(defaultCard?.id ?? '');
  const [useInlinePayment, setUseInlinePayment] = useState(cards.length === 0);
  const [inlinePayment, setInlinePayment] = useState({ cardholderName: '', cardNumber: '' });
  const [processing, setProcessing] = useState(false);
  const success = false;
  const orderNumber = '';
  const pickupCode = '';
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [initializingStripe, setInitializingStripe] = useState(false);
  const [paymentMode, setPaymentMode] = useState<CheckoutPaymentMode>(
    fulfillmentMethod === 'store_pickup' ? 'cash_on_pickup' : 'online',
  );

  const isPickup = fulfillmentMethod === 'store_pickup';
  const stripeEnabled = isStripeClientEnabled();
  const effectivePaymentMode = isPickup ? paymentMode : 'online';
  const useOnlinePayment = !isPickup || effectivePaymentMode === 'online';
  const isCashOnPickup = isPickup && effectivePaymentMode === 'cash_on_pickup';
  const subtotal = items.reduce(
    (sum, i) => sum + resolveQuoteLinePrice(i.price) * i.quantity,
    0,
  );
  const { shipping, total } = calculateOrderTotals(subtotal, fulfillmentMethod, items.length);
  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? defaultCard;

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        sku: item.sku,
        price: resolveQuoteLinePrice(item.price),
        unit: item.unit,
        quantity: item.quantity,
      })),
    [items],
  );

  const orderSignature = useMemo(
    () => orderItems.map((item) => `${item.productId}:${item.quantity}`).join('|'),
    [orderItems],
  );

  const fulfillmentReady = isPickup ? Boolean(pickup) : Boolean(deliveryAddress);

  const buildOrderPayload = useCallback(
    (payment: PlaceOrderInput['payment']): PlaceOrderInput => {
      if (fulfillmentMethod === 'store_pickup' && pickup) {
        return {
          fulfillmentMethod: 'store_pickup',
          pickup,
          payment,
          items: orderItems,
        };
      }

      return {
        fulfillmentMethod: 'delivery',
        deliveryAddress: deliveryAddress!,
        payment,
        items: orderItems,
      };
    },
    [deliveryAddress, fulfillmentMethod, orderItems, pickup],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentMode(fulfillmentMethod === 'store_pickup' ? 'cash_on_pickup' : 'online');
      setError('');
    }, 0);
    return () => clearTimeout(timer);
  }, [fulfillmentMethod]);

  useEffect(() => {
    if (!stripeEnabled || !useOnlinePayment || items.length === 0 || !fulfillmentReady) {
      const resetTimer = setTimeout(() => {
        setClientSecret('');
        setInitializingStripe(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    let cancelled = false;
    const initTimer = setTimeout(() => {
      setInitializingStripe(true);
      setError('');
    }, 0);

    createPaymentIntentAction({
      fulfillmentMethod,
      items: orderItems,
    }).then((result) => {
      if (cancelled) return;
      setInitializingStripe(false);

      if (!result.success || !result.data) {
        setError(result.error ?? 'Unable to initialize Stripe payment');
        setClientSecret('');
        return;
      }

      setClientSecret(result.data.clientSecret);
    });

    return () => {
      cancelled = true;
      clearTimeout(initTimer);
    };
  }, [
    stripeEnabled,
    useOnlinePayment,
    fulfillmentReady,
    fulfillmentMethod,
    orderSignature,
    orderItems,
    items.length,
    total,
  ]);

  async function completeOrder(payment: PlaceOrderInput['payment']) {
    const result = await placeOrderAction(buildOrderPayload(payment));
    if (!result.success) {
      return { success: false as const, error: result.error ?? 'Unable to place order' };
    }

    clearCart();
    clearCheckout();
    router.push(`/account/orders/${encodeURIComponent(result.orderNumber ?? '')}/receipt`);
    return { success: true as const };
  }

  async function handleStripePay(paymentIntentId: string) {
    return completeOrder({
      method: 'stripe',
      paymentIntentId,
    });
  }

  async function handleCashOnPickup() {
    if (!isPickup || !pickup) {
      setError('Complete store pickup details before placing your order.');
      return;
    }

    if (processing || !fulfillmentReady) {
      return;
    }

    setProcessing(true);
    setError('');

    const result = await completeOrder({ method: 'cash_on_pickup' });
    if (!result.success) {
      setError(result.error ?? 'Unable to place order');
      setProcessing(false);
    }
  }

  async function handleDemoPay(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    if (isCashOnPickup) {
      await handleCashOnPickup();
      return;
    }

    if (isPickup && !pickup) {
      setError('Complete store pickup details on checkout before paying.');
      return;
    }

    if (!isPickup && !deliveryAddress) {
      setError('Confirm your delivery address on checkout before paying.');
      return;
    }

    let payment: PlaceOrderInput['payment'];
    if (useInlinePayment || cards.length === 0) {
      const last4 = getCardLast4(inlinePayment.cardNumber);
      if (!inlinePayment.cardholderName.trim() || last4.length !== 4) {
        setError('Enter cardholder name and a valid card number.');
        return;
      }
      payment = {
        method: 'demo',
        cardholderName: inlinePayment.cardholderName.trim(),
        cardLast4: last4,
      };
    } else if (selectedCard) {
      payment = {
        method: 'demo',
        cardholderName: selectedCard.cardholderName,
        cardLast4: selectedCard.last4,
      };
    } else {
      setError('Select a payment method.');
      return;
    }

    setProcessing(true);
    setError('');

    const result = await placeOrderAction(buildOrderPayload(payment));

    if (!result.success) {
      setError(result.error ?? 'Unable to place order');
      setProcessing(false);
      return;
    }

    clearCart();
    clearCheckout();
    router.push(`/account/orders/${encodeURIComponent(result.orderNumber ?? '')}/receipt`);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Demo payment complete</h1>
        <p className="mt-2 text-slate-500">
          Order <span className="font-mono font-medium">{orderNumber}</span> — simulated for
          demonstration.
        </p>
        {isPickup && pickupCode && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
              Your pickup code
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900">{pickupCode}</p>
          </div>
        )}
        <div className="mt-8">
          <RippleButton href="/products">Continue shopping</RippleButton>
        </div>
      </div>
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

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
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
            ) : deliveryAddress ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-700">{deliveryAddress.formattedAddress}</p>
                <Link href="/account/checkout" className="text-sm text-orange-600 hover:underline">
                  Change delivery address
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-red-600">
                No delivery address set.{' '}
                <Link href="/account/checkout" className="underline">
                  Go to checkout
                </Link>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold">Payment method</h2>
              </div>
              {!stripeEnabled && cards.length > 0 && useOnlinePayment && (
                <button
                  type="button"
                  onClick={() => setUseInlinePayment((v) => !v)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  {useInlinePayment ? 'Use saved card' : 'Enter card manually'}
                </button>
              )}
            </div>

            {isPickup && (
              <div className="mt-4">
                <PaymentMethodSelector
                  value={paymentMode}
                  onChange={(mode) => {
                    setPaymentMode(mode);
                    setError('');
                  }}
                  showCashOption
                />
              </div>
            )}

            {isCashOnPickup ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-slate-600">
                  You will pay <strong>{formatPrice(total)}</strong> in cash when you collect your
                  order at the store. No card details are required.
                </p>
                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
                <RippleButton
                  type="button"
                  className={`w-full ${processing || !fulfillmentReady ? 'pointer-events-none opacity-60' : ''}`}
                  variant="primary"
                  onClick={handleCashOnPickup}
                >
                  {processing ? 'Placing order...' : `Place order — pay ${formatPrice(total)} on pickup`}
                </RippleButton>
              </div>
            ) : useOnlinePayment && stripeEnabled ? (
              <div className="mt-4">
                {!fulfillmentReady ? (
                  <p className="text-sm text-red-600">
                    Complete checkout details before paying.
                  </p>
                ) : initializingStripe ? (
                  <p className="text-sm text-slate-500">Preparing secure payment...</p>
                ) : clientSecret ? (
                  <StripePaymentSection
                    clientSecret={clientSecret}
                    total={total}
                    disabled={!fulfillmentReady}
                    onPay={handleStripePay}
                  />
                ) : (
                  <p className="text-sm text-red-600">{error || 'Unable to load payment form.'}</p>
                )}
              </div>
            ) : useOnlinePayment ? (
              <form onSubmit={handleDemoPay} className="mt-4 space-y-4">
                {useInlinePayment || cards.length === 0 ? (
                  <InlinePaymentForm values={inlinePayment} onChange={setInlinePayment} />
                ) : (
                  <ul className="space-y-2">
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

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <RippleButton type="submit" className="w-full" variant="primary">
                  {processing ? 'Processing...' : `Simulate payment (${formatPrice(total)})`}
                </RippleButton>

                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Demo mode — add Stripe keys in .env.local for real payments.
                </p>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Select a payment option above to continue.
              </p>
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
                  <span className="shrink-0">
                    {formatPrice(resolveQuoteLinePrice(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">
                  {isPickup ? 'Pickup fee' : 'Shipping'}
                </dt>
                <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => router.push('/account/checkout')}
              className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-900"
            >
              Back to checkout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
