'use client';

import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import { Product, type ProductVariant } from '@/types/product';
import { buildProductBreadcrumbs } from '@/lib/breadcrumbs';
import { buildProductSpecs } from '@/lib/products/build-product-specs';
import { ProductPurchaseActions } from '@/components/products/product-purchase-actions';
import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { ProductGallery } from '@/components/products/pdp/product-gallery';
import { ProductDownloads } from '@/components/products/pdp/product-downloads';
import { ProductWarehouseStock } from '@/components/products/pdp/product-warehouse-stock';
import { ProductApplications } from '@/components/products/pdp/product-applications';
import { formatAvailabilityLabel } from '@/lib/pricing';
import { useProductCompare } from '@/hooks/use-product-compare';
import { focusRingClass } from '@/hooks/use-dialog-a11y';
import { useState } from 'react';

function inventoryLabel(status?: string | null, inStock?: boolean) {
  return formatAvailabilityLabel(status, inStock);
}

export default function ProductDetail({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null);
  const { add, remove, has, isFull } = useProductCompare();
  const inCompare = has(product.id);

  const activeAvailability = selectedVariant?.availability ?? product.availability;
  const activeInStock = selectedVariant?.in_stock ?? product.in_stock;
  const availabilityLabel = inventoryLabel(activeAvailability, activeInStock);
  const isAvailable =
    activeAvailability === 'available' || (activeInStock && activeAvailability !== 'out_of_stock');

  const specs = buildProductSpecs(product, selectedVariant);
  const breadcrumbs = buildProductBreadcrumbs(product);

  function toggleCompare() {
    if (inCompare) {
      remove(product.id);
      return;
    }
    if (isFull) return;
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: selectedVariant?.sku ?? product.sku,
      image_url: selectedVariant?.image_url ?? product.image_url,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, i) => (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-900">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-900">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <Link
        href="/products"
        className="mb-8 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to catalogue
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} selectedVariant={selectedVariant} />

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-600">
            {selectedVariant?.sku ?? product.sku}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          {product.description && (
            <p className="mt-4 leading-relaxed text-slate-700">{product.description}</p>
          )}
          {product.long_description && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.long_description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {availabilityLabel}
            </span>
            <button
              type="button"
              onClick={toggleCompare}
              disabled={!inCompare && isFull}
              aria-pressed={inCompare}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClass} ${
                inCompare
                  ? 'border-[#0B3D91] bg-[#0B3D91] text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
              {inCompare ? 'In compare' : isFull ? 'Compare full' : 'Compare'}
            </button>
          </div>

          <ProductWarehouseStock warehouseAvailability={product.warehouse_availability ?? []} />

          <ProductVariantSelector
            variants={variants}
            selectedId={selectedVariant?.id ?? null}
            onSelect={setSelectedVariant}
          />

          <div className="mt-8">
            <ProductPurchaseActions
              product={product}
              selectedVariant={selectedVariant}
              layout="detail"
              disabled={!isAvailable}
            />
          </div>

          <ProductDownloads documents={product.documents ?? []} />
          <ProductApplications applications={product.applications} />

          {product.youtube_url && (
            <div className="mt-8 aspect-video overflow-hidden rounded-xl border border-slate-200">
              <iframe
                title={`${product.name} video`}
                src={product.youtube_url.replace('watch?v=', 'embed/')}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}

          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <caption className="sr-only">Product specifications</caption>
              <tbody className="divide-y divide-slate-200">
                {specs.map((spec) => (
                  <tr key={spec.label} className="even:bg-slate-50">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-slate-600">
                      {spec.label}
                    </th>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
