import Link from 'next/link';
import { getAdminProducts } from '@/actions/admin-products';
import { ArchiveProductButton } from './archive-product-button';

export const metadata = { title: 'Products | Admin' };

export default async function AdminProductsPage() {
  const result = await getAdminProducts();

  if (!result.success) {
    return <p className="text-red-600">{result.error}</p>;
  }

  const products = result.data ?? [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">{products.length} products in catalogue</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="text-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.price != null ? `€${p.price.toFixed(2)}` : 'Quote'}
                </td>
                <td className="px-4 py-3">{p.in_stock ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.is_active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-orange-600 hover:underline">
                      Edit
                    </Link>
                    {p.is_active && <ArchiveProductButton id={p.id} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
