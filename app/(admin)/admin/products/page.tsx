import Link from 'next/link';
import { getAdminProducts } from '@/actions/admin-products';
import { ProductsTable } from '@/components/admin/products-table';

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

      <ProductsTable products={products} />
    </div>
  );
}
