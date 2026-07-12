import { notFound } from 'next/navigation';
import { getAdminProduct, getAdminCategoryOptions } from '@/actions/admin-products';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DeleteProductButton } from '@/app/(admin)/admin/products/delete-product-button';
import { ProductForm } from '@/components/admin/product-form';
import { adminButtonDangerClass } from '@/components/admin/admin-styles';

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

  if (!productResult.success || !productResult.data) notFound();

  const product = productResult.data;
  const categoryTree = categoriesResult.success
    ? categoriesResult.data ?? { parents: [], subcategories: [], all: [] }
    : { parents: [], subcategories: [], all: [] };

  return (
    <div>
      <AdminPageHeader
        title="Edit Product"
        description={product.name}
        actions={
          <DeleteProductButton
            id={product.id}
            name={product.name}
            redirectTo="/admin/products"
            className={adminButtonDangerClass}
          />
        }
      />
      <ProductForm categoryTree={categoryTree} product={product} />
    </div>
  );
}
