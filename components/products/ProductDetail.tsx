'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ClipboardList, FileText, ZoomIn, X } from 'lucide-react';
import { Product, INVENTORY_STATUS_OPTIONS, type TechnicalSpecRow } from '@/types/product';
import { buildProductBreadcrumbs } from '@/lib/breadcrumbs';
import { useCart } from '@/context/cart-context';
import { useQuoteCart } from '@/context/quote-cart-context';
import { formatPrice, resolveProductPrice } from '@/lib/pricing';

type SpecRow = { label: string; value: string };

function buildSpecs(product: Product): SpecRow[] {
  const specs: SpecRow[] = [{ label: 'SKU', value: product.sku }];
  if (product.category?.name) specs.push({ label: 'Category', value: product.category.name });

  if (Array.isArray(product.technical_specs)) {
    product.technical_specs.forEach((row: TechnicalSpecRow) => {
      if (row.property && row.value) specs.push({ label: row.property, value: row.value });
    });
  } else if (product.technical_specs && typeof product.technical_specs === 'object') {
    Object.entries(product.technical_specs).forEach(([k, v]) => specs.push({ label: k, value: String(v) }));
  }

  if (product.material) specs.push({ label: 'Material', value: product.material });
  if (product.standard) specs.push({ label: 'Standard', value: product.standard });
  if (product.thread_type) specs.push({ label: 'Thread', value: product.thread_type });
  if (product.diameter_mm != null) specs.push({ label: 'Diameter', value: `${product.diameter_mm} mm` });
  if (product.length_mm != null) specs.push({ label: 'Length', value: `${product.length_mm} mm` });
  if (product.grade) specs.push({ label: 'Grade', value: product.grade });
  if (product.weight_kg != null) specs.push({ label: 'Weight', value: `${product.weight_kg} kg` });

  return specs;
}

function inventoryLabel(status?: string | null) {
  return INVENTORY_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? 'Available';
}

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addItem: addToQuote } = useQuoteCart();
  const [added, setAdded] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const unitPrice = resolveProductPrice(product.price);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [{ id: 'primary', url: product.image_url, thumbnail_url: null, product_id: product.id, sort_order: 0, is_primary: true }]
        : [];

  const [activeImage, setActiveImage] = useState(images[0]?.url ?? null);
  const specs = buildSpecs(product);
  const breadcrumbs = buildProductBreadcrumbs(product);
  const availabilityLabel = inventoryLabel(product.availability);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, i) => (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-900">{crumb.label}</Link>
              ) : (
                <span className="font-medium text-slate-900">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <Link href="/products" className="mb-8 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
        ← Back to catalogue
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => activeImage && setZoomOpen(true)}
            className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
          >
            {activeImage ? (
              <>
                <Image src={activeImage} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                <span className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 text-slate-700 opacity-0 transition group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">No image available</div>
            )}
          </button>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === img.url ? 'border-orange-500' : 'border-slate-200'}`}
                >
                  <Image src={img.thumbnail_url ?? img.url} alt="" fill className="object-contain p-1" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">{product.sku}</p>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          {product.description && <p className="mt-4 leading-relaxed text-slate-700">{product.description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-slate-900 text-white'}`}>
              {availabilityLabel}
            </span>
            {product.stock_quantity != null && product.in_stock && (
              <span className="text-sm text-slate-600">{product.stock_quantity} available</span>
            )}
          </div>

          <p className="mt-6 text-3xl font-bold text-slate-900">
            {formatPrice(unitPrice)}
            <span className="text-base font-normal text-slate-600"> / {product.unit}</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!product.in_stock}
              onClick={() => {
                addItem({ productId: product.id, slug: product.slug, name: product.name, sku: product.sku, price: unitPrice, unit: product.unit, image_url: product.image_url });
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={() => {
                addToQuote({ productId: product.id, slug: product.slug, name: product.name, sku: product.sku, price: unitPrice, unit: product.unit, image_url: product.image_url });
                setQuoted(true);
                setTimeout(() => setQuoted(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              {quoted ? 'Added to quote' : 'Add to quote'}
            </button>
          </div>

          {(product.documents?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-slate-900">Downloads</h2>
              <ul className="mt-3 space-y-2">
                {product.documents?.map((doc) => (
                  <li key={doc.id}>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline">
                      <FileText className="h-4 w-4" /> {doc.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                    <th className="px-4 py-3 text-left font-medium text-slate-600">{spec.label}</th>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {zoomOpen && activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4">
          <button type="button" aria-label="Close zoom" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 rounded-full bg-white p-2">
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image src={activeImage} alt={product.name} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}
