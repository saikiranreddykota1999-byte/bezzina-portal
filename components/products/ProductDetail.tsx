'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductQuoteActions } from './ProductQuoteActions';

type SpecRow = { label: string; value: string };

function buildSpecs(product: Product): SpecRow[] {
  const specs: SpecRow[] = [{ label: 'SKU', value: product.sku }];

  if (product.category?.name) {
    specs.push({ label: 'Category', value: product.category.name });
  }
  if (product.material) specs.push({ label: 'Material', value: product.material });
  if (product.standard) specs.push({ label: 'Standard', value: product.standard });
  if (product.thread_type) specs.push({ label: 'Thread', value: product.thread_type });
  if (product.diameter_mm != null) {
    specs.push({ label: 'Diameter', value: `${product.diameter_mm} mm` });
  }
  if (product.length_mm != null) {
    specs.push({ label: 'Length', value: `${product.length_mm} mm` });
  }
  if (product.grade) specs.push({ label: 'Grade', value: product.grade });

  return specs;
}

function buildBreadcrumb(product: Product): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Products', href: '/products' },
  ];
  if (product.category?.division) {
    const divisionHref =
      product.category.division === 'marine' ? '/marine' : '/industrial';
    crumbs.push({
      label:
        product.category.division === 'marine'
          ? 'Marine Supplies'
          : 'Industrial Equipment',
      href: divisionHref,
    });
  }
  if (product.category?.name) {
    crumbs.push({ label: product.category.name });
  }
  return crumbs;
}

export default function ProductDetail({ product }: { product: Product }) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [{ id: 'primary', url: product.image_url, thumbnail_url: null, product_id: product.id, sort_order: 0, is_primary: true }]
        : [];

  const [activeImage, setActiveImage] = useState(images[0]?.url ?? null);
  const specs = buildSpecs(product);
  const breadcrumbs = buildBreadcrumb(product);

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
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No image available
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === img.url
                      ? 'border-orange-500'
                      : 'border-slate-200'
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
          )}
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            {product.sku}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>

          {product.description && (
            <p className="mt-4 leading-relaxed text-slate-700">{product.description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                product.in_stock
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {product.in_stock ? 'In stock' : 'Out of stock'}
            </span>
            {product.stock_quantity != null && product.in_stock && (
              <span className="text-sm text-slate-600">
                {product.stock_quantity} available
              </span>
            )}
          </div>

          {product.price != null && (
            <p className="mt-6 text-3xl font-bold text-slate-900">
              €{product.price.toFixed(2)}
              <span className="text-base font-normal text-slate-600">
                {' '}
                / {product.unit}
              </span>
            </p>
          )}

          <div className="mt-8">
            <ProductQuoteActions product={product} layout="detail" />
          </div>

          <Link
            href="/contact"
            className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Contact Us
          </Link>

          <dl className="mt-10 divide-y divide-slate-200 border-t border-slate-200">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <dt className="text-slate-600">{spec.label}</dt>
                <dd className="text-right font-medium text-slate-900">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
