import type { Category } from '@/types/product';
import type { CategoryTree } from '@/actions/admin-categories';

const DIVISION_ROOT_SLUGS = new Set(['marine-supplies', 'industrial-equipment']);

export type ProductCategoryGroup = {
  groupLabel: string;
  options: Category[];
};

/** Categories that can hold products (no child categories). */
export function getLeafCategories(categories: Category[]): Category[] {
  const parentIds = new Set(
    categories.map((c) => c.parent_id).filter((id): id is string => Boolean(id)),
  );

  return categories
    .filter((c) => !parentIds.has(c.id))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

function getTopParentName(category: Category, byId: Map<string, Category>): string {
  let current: Category | undefined = category;
  let top = category;

  while (current?.parent_id) {
    const parent = byId.get(current.parent_id);
    if (!parent) break;
    top = parent;
    current = parent;
  }

  return top.name;
}

/** Group leaf categories under their top-level parent for the product form. */
export function buildProductCategoryGroups(tree: CategoryTree): ProductCategoryGroup[] {
  const all = tree.all && tree.all.length > 0 ? tree.all : [...tree.parents, ...tree.subcategories];
  const byId = new Map(all.map((c) => [c.id, c]));
  const leaves = getLeafCategories(all);

  const grouped = new Map<string, Category[]>();
  for (const leaf of leaves) {
    const label = getTopParentName(leaf, byId);
    const list = grouped.get(label) ?? [];
    list.push(leaf);
    grouped.set(label, list);
  }

  return Array.from(grouped.entries())
    .map(([groupLabel, options]) => ({
      groupLabel,
      options: options.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel));
}

/** Normalize DB rows into division roots + all child categories. */
export function normalizeCategoryTree(categories: Category[]): CategoryTree {
  const childrenByParent = new Map<string, Category[]>();
  for (const category of categories) {
    if (!category.parent_id) continue;
    const list = childrenByParent.get(category.parent_id) ?? [];
    list.push(category);
    childrenByParent.set(category.parent_id, list);
  }

  const divisionRoots = categories.filter(
    (c) => !c.parent_id && DIVISION_ROOT_SLUGS.has(c.slug),
  );

  if (divisionRoots.length > 0) {
    const rootIds = new Set(divisionRoots.map((c) => c.id));
    return {
      parents: divisionRoots.sort((a, b) => a.sort_order - b.sort_order),
      subcategories: categories
        .filter((c) => c.parent_id && rootIds.has(c.parent_id))
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    };
  }

  const parents = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const subcategories = categories
    .filter((c) => Boolean(c.parent_id))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  return { parents, subcategories };
}

/** For two-step picker: children of selected parent, or parent itself if leaf. */
export function getSubcategoriesForParent(
  tree: CategoryTree,
  parentId: string,
): Category[] {
  const children = tree.subcategories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  if (children.length > 0) return children;

  const parent = tree.parents.find((c) => c.id === parentId);
  return parent ? [parent] : [];
}
