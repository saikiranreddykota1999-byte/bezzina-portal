import { CategoryManager } from '@/components/admin/category-manager';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminCategoryTree } from '@/actions/admin-categories';

export const metadata = { title: 'Marine Categories | Admin' };

export default async function MarineCategoriesPage() {
  await guardAdminPage('categories:manage');
  const result = await getAdminCategoryTree();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  const tree = result.data!;
  const marineParents = tree.parents.filter((p) => p.division === 'marine');
  const marineSubs = tree.subcategories.filter((s) => {
    const parent = tree.parents.find((p) => p.id === s.parent_id);
    return parent?.division === 'marine';
  });

  return (
    <div>
      <AdminPageHeader
        title="Marine Categories"
        description="Manage marine product categories and subcategories."
      />
      <CategoryManager parents={marineParents} subcategories={marineSubs} />
    </div>
  );
}
