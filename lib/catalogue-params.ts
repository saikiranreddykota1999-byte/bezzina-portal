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
  if (next.sort !== 'name-asc') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', String(next.page));

  return params.toString();
}
