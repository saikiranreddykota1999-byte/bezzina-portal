import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

type SpecRow = { label: string; value: string };

function buildSpecs(product: Product): SpecRow[] {
  const specs: SpecRow[] = [
    { label: 'SKU', value: product.sku },
  ];

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

export default function ProductDetail({ product }: { product: Product }) {
  const specs = buildSpecs(product);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8"
      >
        ← Back to catalogue
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              No image available
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            {product.sku}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                product.in_stock
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-900 text-white'
              }`}
            >
              {product.in_stock ? 'In stock' : 'Out of stock'}
            </span>
            {product.stock_quantity != null && product.in_stock && (
              <span className="text-sm text-gray-500">
                {product.stock_quantity} available
              </span>
            )}
          </div>

          {product.price != null && (
            <p className="mt-6 text-3xl font-bold text-gray-900">
              €{product.price.toFixed(2)}
              <span className="text-base font-normal text-gray-400">
                {' '}
                / {product.unit}
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Request a Quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Contact Us
            </Link>
          </div>

          <dl className="mt-10 divide-y divide-gray-200 border-t border-gray-200">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <dt className="text-gray-500">{spec.label}</dt>
                <dd className="font-medium text-gray-900 text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
