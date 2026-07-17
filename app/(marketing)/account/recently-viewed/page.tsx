import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getRecentlyViewedProducts } from '@/actions/customer-portal';

export const metadata = { title: 'Recently Viewed | Account' };

export default async function RecentlyViewedPage() {
  const result = await getRecentlyViewedProducts();
  if (!result.success && result.error === 'Sign in required') redirect('/account/login');

  const products = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Recently Viewed</h1>
      <p className="mb-6 text-sm text-slate-600">Products you have browsed recently.</p>

      {products.length === 0 ? (
        <p className="text-sm text-slate-600">No recently viewed products yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                  {product.image_url ? (
                    <Image src={product.image_url} alt="" fill className="object-contain p-1" sizes="64px" />
                  ) : null}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-600">{product.sku}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(product.viewed_at).toLocaleString('en-GB')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
