'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { RippleButton } from '@/components/ui/ripple-button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <p className="mt-8 text-slate-500">Your cart is empty.</p>
        <RippleButton href="/products" className="mt-6">Browse Products</RippleButton>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <button type="button" onClick={clearCart} className="text-sm text-slate-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <ul className="mt-8 divide-y divide-slate-200">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 py-4">
            <div className="relative h-20 w-20 shrink-0 rounded-lg bg-slate-100">
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} fill className="object-contain p-2" />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.slug}`} className="font-medium text-slate-900 hover:underline">
                {item.name}
              </Link>
              <p className="text-xs text-slate-400">{item.sku}</p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <button type="button" onClick={() => removeItem(item.productId)} className="text-sm text-red-600">
                  Remove
                </button>
              </div>
            </div>
            {item.price != null && (
              <p className="font-semibold text-slate-900">€{(item.price * item.quantity).toFixed(2)}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <RippleButton href="/account/checkout">Proceed to Checkout</RippleButton>
      </div>
    </div>
  );
}
