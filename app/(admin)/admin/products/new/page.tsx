import { getAdminCategoryOptions } from '@/actions/admin-products';
import { ProductForm } from '@/components/admin/product-form';

export const metadata = { title: 'New Product | Admin' };

export default async function NewProductPage() {
  const categoriesResult = await getAdminCategoryOptions();
  const categoryTree = categoriesResult.success
    ? categoriesResult.data ?? { parents: [], subcategories: [] }
    : { parents: [], subcategories: [] };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Product</h1>
      {!categoriesResult.success && (
        <p className="mb-4 text-sm text-amber-800">{categoriesResult.error}</p>
      )}
      <ProductForm categoryTree={categoryTree} />
    </div>
  );
}
