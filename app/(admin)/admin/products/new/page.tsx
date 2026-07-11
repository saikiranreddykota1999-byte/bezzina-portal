import { getAdminCategories } from '@/actions/admin-products';
import { ProductForm } from '@/components/admin/product-form';

export const metadata = { title: 'New Product | Admin' };

export default async function NewProductPage() {
  const categoriesResult = await getAdminCategories();
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
