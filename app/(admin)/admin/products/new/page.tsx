import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminCategoryOptions } from '@/actions/admin-products/crud';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductForm } from '@/components/admin/product-form';

export const metadata = { title: 'New Product | Admin' };

export default async function NewProductPage() {
  await guardAdminPage('products:manage');
  const categoriesResult = await getAdminCategoryOptions();
  const categoryTree = categoriesResult.success
    ? categoriesResult.data ?? { parents: [], subcategories: [], all: [] }
    : { parents: [], subcategories: [], all: [] };

  return (
    <div>
      <AdminPageHeader title="Add Product" />
      {!categoriesResult.success && (
        <p className="mb-4 text-sm text-[var(--admin-warning)]">{categoriesResult.error}</p>
      )}
      <ProductForm categoryTree={categoryTree} />
    </div>
  );
}
