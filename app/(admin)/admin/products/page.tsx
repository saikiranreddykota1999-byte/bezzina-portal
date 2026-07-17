import Link from 'next/link';
import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminProducts } from '@/actions/admin-products/crud';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductImportPanel } from '@/components/admin/product-import-panel';
import { ProductsTable } from '@/components/admin/products-table';
import { adminButtonPrimaryClass, adminButtonSecondaryClass } from '@/components/admin/admin-styles';

export const metadata = { title: 'Products | Admin' };

export default async function AdminProductsPage() {
  await guardAdminPage('products:manage');
  const result = await getAdminProducts();

  if (!result.success) {
    return <p className="text-[var(--admin-danger)]">{result.error}</p>;
  }

  const products = result.data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products in catalogue`}
        actions={
          <>
            <Link href="/admin/categories" className={adminButtonSecondaryClass}>
              Manage Categories
            </Link>
            <Link href="/admin/products/new" className={adminButtonPrimaryClass}>
              Add Product
            </Link>
          </>
        }
      />
      <ProductImportPanel />
      <ProductsTable products={products} />
    </div>
  );
}
