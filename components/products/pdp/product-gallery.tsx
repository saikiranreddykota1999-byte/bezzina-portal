'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import type { Product, ProductImage, ProductVariant } from '@/types/product';
import { focusRingClass } from '@/hooks/use-dialog-a11y';
import { ProductImageZoom } from '@/components/products/pdp/product-image-zoom';
import { ProductSpinViewer } from '@/components/products/pdp/product-spin-viewer';

type Props = {
  product: Product;
  selectedVariant: ProductVariant | null;
};

function resolveGalleryImages(
  product: Product,
  selectedVariant: ProductVariant | null,
): ProductImage[] {
  if (selectedVariant?.image_url) {
    return [
      {
        id: 'variant',
        url: selectedVariant.image_url,
        thumbnail_url: null,
        product_id: product.id,
        sort_order: 0,
        is_primary: true,
      },
    ];
  }
  if (product.images && product.images.length > 0) return product.images;
  if (product.image_url) {
    return [
      {
        id: 'primary',
        url: product.image_url,
        thumbnail_url: null,
        product_id: product.id,
        sort_order: 0,
        is_primary: true,
      },
    ];
  }
  return [];
}

export function ProductGallery({ product, selectedVariant }: Props) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [userSelectedUrl, setUserSelectedUrl] = useState<string | null>(null);

  const images = useMemo(
    () => resolveGalleryImages(product, selectedVariant),
    [product, selectedVariant],
  );

  const activeImage =
    userSelectedUrl && images.some((image) => image.url === userSelectedUrl)
      ? userSelectedUrl
      : (images[0]?.url ?? null);
  const spinFrames = product.spin_frames ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => activeImage && setZoomOpen(true)}
        disabled={!activeImage}
        aria-label={activeImage ? `Enlarge image of ${product.name}` : undefined}
        className={`group relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${focusRingClass}`}
      >
        {activeImage ? (
          <>
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <span
              className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 text-slate-700 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              <ZoomIn className="h-4 w-4" />
            </span>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            No image available
          </div>
        )}
      </button>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto" role="list" aria-label="Product images">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setUserSelectedUrl(img.url)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={activeImage === img.url ? 'true' : undefined}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${focusRingClass} ${
                activeImage === img.url ? 'border-orange-500' : 'border-slate-200'
              }`}
            >
              <Image
                src={img.thumbnail_url ?? img.url}
                alt=""
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <ProductSpinViewer frames={spinFrames} productName={product.name} />

      {activeImage ? (
        <ProductImageZoom
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          src={activeImage}
          alt={product.name}
        />
      ) : null}
    </div>
  );
}
