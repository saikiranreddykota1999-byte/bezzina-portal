'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { createPaymentIntentAction } from '@/actions/stripe-payment';
import { placeOrderAction } from '@/actions/pickup/customer';
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
import { calculateOrderTotals } from '@/lib/checkout';
import { formatPrice, resolveQuoteLinePrice } from '@/lib/pricing';
import { isDemoPaymentAllowed } from '@/lib/payment';
import { isStripeClientEnabled } from '@/lib/stripe/client';
import { RippleButton } from '@/components/ui/ripple-button';
import { CheckoutFulfillmentSummary } from '@/components/checkout/payment-checkout/fulfillment-summary';
import { CheckoutOrderSummary } from '@/components/checkout/payment-checkout/order-summary';
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
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [initializingStripe, setInitializingStripe] = useState(false);
  const [paymentMode, setPaymentMode] = useState<CheckoutPaymentMode>(
    fulfillmentMethod === 'store_pickup' ? 'cash_on_pickup' : 'online',
  );

  const isPickup = fulfillmentMethod === 'store_pickup';
  const stripeEnabled = isStripeClientEnabled();
  const demoPaymentsAllowed = isDemoPaymentAllowed(stripeEnabled);
  const effectivePaymentMode = isPickup ? paymentMode : 'online';
  const useOnlinePayment = !isPickup || effectivePaymentMode === 'online';
  const isCashOnPickup = isPickup && effectivePaymentMode === 'cash_on_pickup';
  const subtotal = items.reduce(
    (sum, i) => sum + resolveQuoteLinePrice(i.price) * i.quantity,
    0,
  );
  const { shipping, total, vat, net } = calculateOrderTotals(
    subtotal,
    fulfillmentMethod,
    items.length,
  );
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

      if (!result.success) {
        setError(result.error);
        setClientSecret('');
        return;
      }

      if (!result.data) {
        setError('Unable to initialize Stripe payment');
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

    if (!demoPaymentsAllowed) {
      setError('Card payments require Stripe. Configure live payment keys before checkout.');
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
          <CheckoutFulfillmentSummary
            isPickup={isPickup}
            pickup={pickup}
            deliveryAddress={deliveryAddress}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <CreditCard className="h-5 w-5 text-orange-800" />
                <h2 className="font-semibold">Payment method</h2>
              </div>
              {!stripeEnabled && demoPaymentsAllowed && cards.length > 0 && useOnlinePayment && (
                <button
                  type="button"
                  onClick={() => setUseInlinePayment((v) => !v)}
                  className="text-sm text-orange-800 hover:underline"
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
            ) : useOnlinePayment && demoPaymentsAllowed ? (
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
                            className="text-orange-800"
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
            ) : useOnlinePayment ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Online card payments are not configured. Add Stripe keys to enable checkout, or choose
                cash on pickup for store collection orders.
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Select a payment option above to continue.
              </p>
            )}
          </section>
        </div>

        <CheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          vat={vat}
          net={net}
          isPickup={isPickup}
          onBack={() => router.push('/account/checkout')}
        />
      </div>
    </div>
  );
}
