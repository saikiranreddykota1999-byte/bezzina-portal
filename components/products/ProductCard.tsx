'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { LiftCard } from '@/components/motion/lift-card';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { formatAvailabilityLabel } from '@/lib/pricing';
import { buildCartLineItem } from '@/lib/products/build-cart-line-item';
import { ProductPurchaseActions } from './product-purchase-actions';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const availabilityLabel = formatAvailabilityLabel(product.availability, product.in_stock);
  const variantCount = product.variants?.length ?? 0;

  return (
    <LiftCard>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300">
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
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
                price: 0,
                image_url: product.image_url,
              });
            }}
            className={`rounded-full p-2 shadow-sm ${wished ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault();
              addItem(buildCartLineItem(product));
            }}
            className="rounded-full bg-white p-2 text-slate-700 shadow-sm hover:bg-orange-50 hover:text-orange-600"
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
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No image
              </div>
            )}

            <span className="absolute left-2 top-2 rounded bg-[#0B3D91] px-2 py-1 text-xs font-medium text-white">
              {availabilityLabel}
            </span>
            {product.featured && (
              <span className="absolute bottom-2 left-2 rounded bg-[#D8A106] px-2 py-1 text-xs font-medium text-slate-900">
                Featured
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              {product.sku}
            </p>
            <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-slate-900">
              {product.name}
            </h3>

            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs text-slate-600">
              {product.material && <span>{product.material}</span>}
              {variantCount > 0 && <span>{variantCount} sizes</span>}
            </div>

            <p className="mt-3 text-sm font-semibold text-[#0B3D91]">
              {availabilityLabel}
            </p>
          </div>
        </Link>

        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <ProductPurchaseActions product={product} layout="card" />
        </div>
      </div>
    </LiftCard>
  );
}
