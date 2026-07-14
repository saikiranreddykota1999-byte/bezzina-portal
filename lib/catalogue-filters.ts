import {
  Product,
  Category,
  ProductFilters,
  PaginatedProducts,
  SortOption,
  CategoryDivision,
} from '@/types/product';

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    case 'newest':
      return sorted.reverse();
    case 'name-asc':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function scopeCategoriesForDivision(
  categories: Category[],
  division?: CategoryDivision,
): Category[] {
  if (!division) {
    return categories.filter((c) => c.parent_id || c.slug.includes('-'));
  }

  return categories.filter(
    (c) =>
      c.slug.startsWith(`${division}-`) &&
      !c.slug.endsWith('-supplies') &&
      !c.slug.endsWith('-equipment'),
  );
}

export function scopeSubcategoriesForDivision(
  categories: Category[],
  division?: CategoryDivision,
): Category[] {
  return scopeCategoriesForDivision(categories, division).filter((c) => c.parent_id);
}

export function scopeParentCategories(
  categories: Category[],
  division?: CategoryDivision,
): Category[] {
  const parents = categories.filter((c) => !c.parent_id);
  if (!division) {
    return parents.filter((c) => c.division === 'marine' || c.division === 'industrial');
  }
  return parents.filter((c) => c.division === division);
}

export function filterProductsByParentCategory(
  products: Product[],
  categories: Category[],
  parentSlug: string | null,
): Product[] {
  if (!parentSlug) return products;

  const parent = categories.find((c) => c.slug === parentSlug && !c.parent_id);
  if (!parent) return products;

  const childIds = new Set(
    categories.filter((c) => c.parent_id === parent.id).map((c) => c.id),
  );

  return products.filter((p) => p.category_id && childIds.has(p.category_id));
}

export function scopeProductsForDivision(
  products: Product[],
  categories: Category[],
  division?: CategoryDivision,
): Product[] {
  if (!division) return products;

  const divisionCategoryIds = new Set(
    categories.filter((c) => c.slug.startsWith(`${division}-`)).map((c) => c.id),
  );

  return products.filter(
    (p) => p.category_id && divisionCategoryIds.has(p.category_id),
  );
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): PaginatedProducts {
  const {
    query = '',
    categoryId,
    brandId,
    inStockOnly,
    material,
    standard,
    availability = 'all',
    marineGrade,
    industrialGrade,
    featured,
    fastSelling,
    newArrival,
    recentlyAdded,
    sort = 'name-asc',
    page = 1,
    pageSize = 24,
  } = filters;

  const q = query.trim().toLowerCase();

  let filtered = products.filter((p) => {
    if (categoryId && categoryId !== 'all' && p.category_id !== categoryId) return false;
    if (brandId && brandId !== 'all' && p.brand_id !== brandId) return false;
    if (inStockOnly && !p.in_stock) return false;
    if (material && material !== 'all' && p.material !== material) return false;
    if (standard && standard !== 'all' && p.standard !== standard) return false;
    if (availability !== 'all' && p.availability !== availability) return false;
    if (marineGrade && !p.marine_grade) return false;
    if (industrialGrade && !p.industrial_grade) return false;
    if (featured && !p.featured) return false;
    if (fastSelling && !p.fast_selling) return false;
    if (newArrival && !p.new_arrival) return false;
    if (recentlyAdded && !p.recently_added) return false;

    if (q) {
      const haystack = [
        p.name,
        p.sku,
        p.description,
        p.thread_type,
        p.material,
        p.standard,
        p.search_keywords,
        p.brand?.name,
        ...(p.tags ?? []),
        ...(p.variants ?? []).flatMap((variant) => [variant.name, variant.sku, variant.specification]),
        ...(Array.isArray(p.technical_specs)
          ? p.technical_specs.map((s) => `${s.property} ${s.value}`)
          : p.technical_specs
            ? Object.entries(p.technical_specs).map(([k, v]) => `${k} ${v}`)
            : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  filtered = sortProducts(filtered, sort);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    products: paginated,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function getUniqueMaterials(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.material).filter(Boolean) as string[])].sort();
}

export function getUniqueStandards(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.standard).filter(Boolean) as string[])].sort();
}
