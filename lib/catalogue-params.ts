import { SortOption } from '@/types/product';

const SORT_OPTIONS: SortOption[] = [
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
  'newest',
];

export type CatalogueSearchParams = {
  category?: string;
  parent?: string;
  q?: string;
  material?: string;
  standard?: string;
  inStock?: string;
  availability?: string;
  marine?: string;
  industrial?: string;
  featured?: string;
  fast?: string;
  new?: string;
  recent?: string;
  sort?: string;
  page?: string;
};

export type ParsedCatalogueParams = {
  categorySlug: string | null;
  parentSlug: string | null;
  query: string;
  material: string;
  standard: string;
  inStockOnly: boolean;
  availability: string;
  marineGrade: boolean;
  industrialGrade: boolean;
  featured: boolean;
  fastSelling: boolean;
  newArrival: boolean;
  recentlyAdded: boolean;
  sort: SortOption;
  page: number;
};

export function parseCatalogueParams(
  params: CatalogueSearchParams,
): ParsedCatalogueParams {
  const sort = SORT_OPTIONS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : 'name-asc';

  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  return {
    categorySlug: params.category ?? null,
    parentSlug: params.parent ?? null,
    query: params.q ?? '',
    material: params.material ?? 'all',
    standard: params.standard ?? 'all',
    inStockOnly: params.inStock === '1',
    availability: params.availability ?? 'all',
    marineGrade: params.marine === '1',
    industrialGrade: params.industrial === '1',
    featured: params.featured === '1',
    fastSelling: params.fast === '1',
    newArrival: params.new === '1',
    recentlyAdded: params.recent === '1',
    sort,
    page,
  };
}

export function buildCatalogueQuery(
  current: ParsedCatalogueParams,
  updates: Partial<ParsedCatalogueParams>,
): string {
  const next = { ...current, ...updates, page: updates.page ?? 1 };
  const params = new URLSearchParams();

  if (next.query.trim()) params.set('q', next.query.trim());
  if (next.parentSlug) params.set('parent', next.parentSlug);
  if (next.categorySlug) params.set('category', next.categorySlug);
  if (next.material !== 'all') params.set('material', next.material);
  if (next.standard !== 'all') params.set('standard', next.standard);
  if (next.inStockOnly) params.set('inStock', '1');
  if (next.availability !== 'all') params.set('availability', next.availability);
  if (next.marineGrade) params.set('marine', '1');
  if (next.industrialGrade) params.set('industrial', '1');
  if (next.featured) params.set('featured', '1');
  if (next.fastSelling) params.set('fast', '1');
  if (next.newArrival) params.set('new', '1');
  if (next.recentlyAdded) params.set('recent', '1');
  if (next.sort !== 'name-asc') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', String(next.page));

  return params.toString();
}
