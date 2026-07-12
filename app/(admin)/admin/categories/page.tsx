import { getAdminCategoryTree } from '@/actions/admin-categories';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CategoryManager } from '@/components/admin/category-manager';

export const metadata = { title: 'Categories | Admin' };

export default async function AdminCategoriesPage() {
  const result = await getAdminCategoryTree();

  if (!result.success) {
    return <p className="text-[var(--admin-danger)]">{result.error}</p>;
  }

  const { parents, subcategories } = result.data ?? { parents: [], subcategories: [] };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organise products under marine and industrial categories without redeploying code."
      />
      <CategoryManager parents={parents} subcategories={subcategories} />
    </div>
  );
}
