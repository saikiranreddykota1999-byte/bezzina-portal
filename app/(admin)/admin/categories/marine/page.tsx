import { CategoryManager } from '@/components/admin/category-manager';
import { getAdminCategoryTree } from '@/actions/admin-categories';

export const metadata = { title: 'Marine Categories | Admin' };

export default async function MarineCategoriesPage() {
  const result = await getAdminCategoryTree();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  const tree = result.data!;
  const marineParents = tree.parents.filter((p) => p.division === 'marine');
  const marineSubs = tree.subcategories.filter((s) => {
    const parent = tree.parents.find((p) => p.id === s.parent_id);
    return parent?.division === 'marine';
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Marine Categories</h1>
      <p className="mt-1 text-sm text-slate-600">Manage marine product categories and subcategories.</p>
      <div className="mt-8">
        <CategoryManager parents={marineParents} subcategories={marineSubs} />
      </div>
    </div>
  );
}
