'use client';

import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { RippleButton } from '@/components/ui/ripple-button';

export default function CheckoutPage() {
  const { items } = useCart();
  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  const shipping = items.length > 0 ? 12.5 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-8 text-slate-500">Your cart is empty.</p>
        <RippleButton href="/products" className="mt-6">Browse Products</RippleButton>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Review your order before proceeding to payment.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{subtotal > 0 ? `€${subtotal.toFixed(2)}` : 'Quote on request'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd>€{shipping.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd>{subtotal > 0 ? `€${total.toFixed(2)}` : `€${shipping.toFixed(2)}`}</dd>
            </div>
          </dl>
          <RippleButton href="/account/payment" className="mt-6 w-full">
            Continue to payment
          </RippleButton>
          <Link href="/account/cart" className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-900">
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
