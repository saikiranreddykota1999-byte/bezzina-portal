import { describe, expect, it } from 'vitest';
import {
  buildProductCategoryGroups,
  getLeafCategories,
  normalizeCategoryTree,
} from '@/lib/catalogue/category-tree';
import type { CategoryTree } from '@/actions/admin-categories';
import type { Category } from '@/types/product';

const categories: Category[] = [
  {
    id: 'root-ind',
    name: 'Industrial Equipment',
    slug: 'industrial-equipment',
    description: null,
    sort_order: 1,
    division: 'industrial',
    parent_id: null,
  },
  {
    id: 'bolts-parent',
    name: 'Bolts & Fasteners',
    slug: 'industrial-bolts-fasteners',
    description: null,
    sort_order: 5,
    division: 'industrial',
    parent_id: 'root-ind',
  },
  {
    id: 'hex-bolts',
    name: 'Hex Bolts',
    slug: 'ind-bf-hex-bolts',
    description: null,
    sort_order: 1,
    division: 'industrial',
    parent_id: 'bolts-parent',
  },
  {
    id: 'nuts',
    name: 'Nuts',
    slug: 'ind-bf-nuts',
    description: null,
    sort_order: 2,
    division: 'industrial',
    parent_id: 'bolts-parent',
  },
];

describe('category-tree', () => {
  it('normalizes division roots and direct children', () => {
    const tree = normalizeCategoryTree(categories);
    expect(tree.parents).toHaveLength(1);
    expect(tree.parents[0]?.slug).toBe('industrial-equipment');
    expect(tree.subcategories.map((c) => c.slug)).toEqual(['industrial-bolts-fasteners']);
  });

  it('returns only leaf categories for product assignment', () => {
    const leaves = getLeafCategories(categories);
    expect(leaves.map((c) => c.name)).toEqual(['Hex Bolts', 'Nuts']);
  });

  it('groups leaf categories under top parent for product form', () => {
    const tree: CategoryTree = {
      parents: [categories[0]],
      subcategories: categories.slice(1),
      all: categories,
    };
    const groups = buildProductCategoryGroups(tree);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.groupLabel).toBe('Industrial Equipment');
    expect(groups[0]?.options.map((c) => c.name)).toEqual(['Hex Bolts', 'Nuts']);
  });
});
