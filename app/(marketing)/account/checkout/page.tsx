'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useCheckout } from '@/context/checkout-context';
import { DemoModeBanner } from '@/components/account/demo-mode-banner';
import { FulfillmentSelector } from '@/components/checkout/fulfillment-selector';
import { PickupScheduler } from '@/components/checkout/pickup-scheduler';
import { calculateOrderTotals } from '@/lib/checkout';
import { RippleButton } from '@/components/ui/ripple-button';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const {
    fulfillmentMethod,
    pickup,
    setFulfillmentMethod,
    setPickupSelection,
    isPickupComplete,
  } = useCheckout();

  const subtotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const { shipping, total } = calculateOrderTotals(subtotal, fulfillmentMethod, items.length);

  function handleContinue() {
    if (fulfillmentMethod === 'store_pickup' && !isPickupComplete) {
      return;
    }
    router.push('/account/payment');
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-8 text-slate-500">Your cart is empty.</p>
        <RippleButton href="/products" className="mt-6">
          Browse Products
        </RippleButton>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        Choose delivery or store pickup, then review your order.
      </p>

      <div className="mt-6">
        <DemoModeBanner />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FulfillmentSelector value={fulfillmentMethod} onChange={setFulfillmentMethod} />
          </div>

          {fulfillmentMethod === 'store_pickup' && (
            <PickupScheduler value={pickup} onChange={setPickupSelection} />
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Order items</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between py-3 text-sm">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  {item.price != null && (
                    <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-semibold text-slate-900">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{subtotal > 0 ? `€${subtotal.toFixed(2)}` : 'Quote on request'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                {fulfillmentMethod === 'store_pickup' ? 'Pickup fee' : 'Shipping'}
              </dt>
              <dd>{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd>{subtotal > 0 ? `€${total.toFixed(2)}` : `€${shipping.toFixed(2)}`}</dd>
            </div>
          </dl>

          <RippleButton
            type="button"
            className="mt-6 w-full"
            onClick={handleContinue}
          >
            Continue to payment
          </RippleButton>

          {!isPickupComplete && fulfillmentMethod === 'store_pickup' && (
            <p className="mt-2 text-center text-xs text-red-600">
              Select a branch, date, and time slot to continue.
            </p>
          )}

          <Link
            href="/account/cart"
            className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-900"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
