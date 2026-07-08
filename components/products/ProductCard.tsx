'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { LiftCard } from '@/components/motion/lift-card';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);

  return (
    <LiftCard>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300">
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(e) => {
              e.preventDefault();
              toggle({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                price: product.price,
                image_url: product.image_url,
              });
            }}
            className={`rounded-full p-2 shadow-sm ${wished ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault();
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                price: product.price,
                unit: product.unit,
                image_url: product.image_url,
              });
            }}
            className="rounded-full bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative aspect-square bg-slate-50">
            {product.image_url ? (
              <motion.div
                className="relative h-full w-full"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-300">
                No image
              </div>
            )}

            {!product.in_stock && (
              <span className="absolute left-2 top-2 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                Out of stock
              </span>
            )}
            {product.discount_percent != null && product.discount_percent > 0 && (
              <span className="absolute bottom-2 left-2 rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
              {product.sku}
            </p>
            <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-slate-900">
              {product.name}
            </h3>

            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs text-slate-500">
              {product.brand?.name && <span>{product.brand.name}</span>}
              {product.thread_type && <span>{product.thread_type}</span>}
              {product.material && <span>{product.material}</span>}
            </div>

            {product.price != null && (
              <p className="mt-3 font-semibold text-slate-900">
                €{product.price.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
              </p>
            )}
          </div>
        </Link>
      </div>
    </LiftCard>
  );
}
