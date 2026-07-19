'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCompareProductsAction } from '@/actions/product-compare';
import { buildCompareMatrix } from '@/lib/products/compare-matrix';
import { useProductCompare } from '@/hooks/use-product-compare';
import type { Product } from '@/types/product';

export function ComparePageClient() {
  const { items } = useProductCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(items.length > 0);
  const [error, setError] = useState<string | null>(null);
  const idsKey = items.map((item) => item.id).join(',');

  useEffect(() => {
    if (!idsKey) {
      return;
    }

    const ids = idsKey.split(',');
    let cancelled = false;

    void getCompareProductsAction(ids).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setProducts([]);
      } else {
        setError(null);
        setProducts(result.data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Compare products</h1>
        <p className="mt-4 text-slate-600">No products selected for comparison yet.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09407a]"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Compare products</h1>
        <p className="mt-4 text-slate-600">Loading comparison…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Compare products</h1>
        <p className="mt-4 text-red-700" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const matrix = buildCompareMatrix(products);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Compare products</h1>
      <p className="mt-2 text-sm text-slate-600">
        Side-by-side comparison of up to {items.length} selected products.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <caption className="sr-only">Product comparison matrix</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Feature
              </th>
              {products.map((product) => (
                <th
                  key={product.id}
                  scope="col"
                  className="min-w-[180px] px-4 py-3 text-left font-semibold text-slate-900"
                >
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    {product.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {matrix.map((row) => (
              <tr key={row.label} className="even:bg-slate-50">
                <th scope="row" className="px-4 py-3 text-left font-medium text-slate-600">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${products[index]?.id ?? index}`}
                    className="px-4 py-3 text-slate-900"
                  >
                    {value ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
