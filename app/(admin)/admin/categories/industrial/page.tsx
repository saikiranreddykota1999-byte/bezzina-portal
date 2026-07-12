import { CategoryManager } from '@/components/admin/category-manager';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { getAdminCategoryTree } from '@/actions/admin-categories';

export const metadata = { title: 'Industrial Categories | Admin' };

export default async function IndustrialCategoriesPage() {
  const result = await getAdminCategoryTree();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  const tree = result.data!;
  const industrialParents = tree.parents.filter((p) => p.division === 'industrial');
  const industrialSubs = tree.subcategories.filter((s) => {
    const parent = tree.parents.find((p) => p.id === s.parent_id);
    return parent?.division === 'industrial';
  });

  return (
    <div>
      <AdminPageHeader
        title="Industrial Categories"
        description="Manage industrial product categories and subcategories."
      />
      <CategoryManager parents={industrialParents} subcategories={industrialSubs} />
    </div>
  );
}
