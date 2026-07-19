'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/wishlist-context';
import { RippleButton } from '@/components/ui/ripple-button';

export default function WishlistPage() {
  const { items, remove, synced } = useWishlist();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">
        {synced
          ? 'Saved to your account and available across devices.'
          : 'Sign in to sync your wishlist across devices.'}
      </p>
      {items.length === 0 ? (
        <p className="mt-8 text-slate-500">No saved products yet.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 rounded-xl border border-slate-200 p-4">
              <div className="relative h-16 w-16 shrink-0 rounded bg-slate-100">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium text-slate-900 hover:underline">
                  {item.name}
                </Link>
                <p className="text-xs text-slate-600">{item.sku}</p>
                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  className="mt-2 text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <RippleButton href="/products" className="mt-6" variant="secondary">
        Browse Products
      </RippleButton>
    </div>
  );
}
