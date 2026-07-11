import { getAdminCategoryTree } from '@/actions/admin-categories';
import { CategoryManager } from '@/components/admin/category-manager';

export const metadata = { title: 'Categories | Admin' };

export default async function AdminCategoriesPage() {
  const result = await getAdminCategoryTree();

  if (!result.success) {
    return <p className="text-red-600">{result.error}</p>;
  }

  const { parents, subcategories } = result.data ?? { parents: [], subcategories: [] };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Categories</h1>
      <p className="mb-8 text-sm text-slate-600">
        Organise products under marine and industrial categories without redeploying code.
      </p>
      <CategoryManager parents={parents} subcategories={subcategories} />
    </div>
  );
}
