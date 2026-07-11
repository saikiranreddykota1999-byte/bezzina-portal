import { notFound } from 'next/navigation';
import { getAdminProduct, getAdminCategoryOptions } from '@/actions/admin-products';
import { ProductForm } from '@/components/admin/product-form';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const result = await getAdminProduct(id);
  return {
    title: result.success && result.data
      ? `Edit ${result.data.name} | Admin`
      : 'Edit Product | Admin',
  };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [productResult, categoriesResult] = await Promise.all([
    getAdminProduct(id),
    getAdminCategoryOptions(),
  ]);

  if (!productResult.success) notFound();

  const categoryTree = categoriesResult.success
    ? categoriesResult.data ?? { parents: [], subcategories: [] }
    : { parents: [], subcategories: [] };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Product</h1>
      <ProductForm categoryTree={categoryTree} product={productResult.data} />
    </div>
  );
}
