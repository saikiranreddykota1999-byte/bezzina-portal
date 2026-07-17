'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import {
  Category,
  CategoryDivision,
  PaginatedProducts,
  SortOption,
} from '@/types/product';
import {
  buildCatalogueQuery,
  type ParsedCatalogueParams,
} from '@/lib/catalogue-params';
import ProductCard from './ProductCard';
import { CatalogueEmptyState } from './catalogue-empty-state';
import {
  CatalogueFilterGroup,
  CatalogueFilterToggle,
} from './catalogue/catalogue-filters';

interface Props {
  result: PaginatedProducts;
  subcategories: Category[];
  parentCategories: Category[];
  materials: string[];
  standards: string[];
  filters: ParsedCatalogueParams;
  division?: CategoryDivision;
  title?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const selectClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

export default function ProductCatalogue({
  result,
  subcategories,
  parentCategories,
  materials,
  standards,
  filters,
  division,
  title,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(filters.query);
  const [showFilters, setShowFilters] = useState(false);

  const showParentFilter = !division && parentCategories.length > 0;

  const selectedSubcategorySlug = filters.categorySlug ?? 'all';

  const navigate = useCallback(
    (updates: Partial<ParsedCatalogueParams>) => {
      const qs = buildCatalogueQuery(filters, updates);
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [filters, pathname, router],
  );

  useEffect(() => {
    const timer = setTimeout(() => setQuery(filters.query), 0);
    return () => clearTimeout(timer);
  }, [filters.query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query === filters.query) return;
      navigate({ query, page: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters.query, navigate]);

  return (
    <div>
      {title && <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>}

      <div className="mb-6 space-y-4">
        <div
          className={`grid gap-3 ${showParentFilter ? 'lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]' : 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'}`}
        >
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, specs, tags..."
              aria-label="Search products"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {showParentFilter && (
            <div>
              <label htmlFor="catalogue-parent" className="sr-only">
                Category
              </label>
              <select
                id="catalogue-parent"
                value={filters.parentSlug ?? 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  navigate({
                    parentSlug: value === 'all' ? null : value,
                    categorySlug: null,
                    page: 1,
                  });
                }}
                className={selectClass}
              >
                <option value="all">All categories</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="catalogue-subcategory" className="sr-only">
              Subcategory
            </label>
            <select
              id="catalogue-subcategory"
              value={selectedSubcategorySlug}
              onChange={(e) => {
                const value = e.target.value;
                navigate({
                  categorySlug: value === 'all' ? null : value,
                  page: 1,
                });
              }}
              className={selectClass}
            >
              <option value="all">
                {showParentFilter ? 'All subcategories' : 'All categories'}
              </option>
              {subcategories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => navigate({ sort: e.target.value as SortOption, page: 1 })}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            More filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <CatalogueFilterGroup label="Material" htmlFor="catalogue-material">
            <select
              id="catalogue-material"
              value={filters.material}
              onChange={(e) => navigate({ material: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </CatalogueFilterGroup>

          <CatalogueFilterGroup label="Standard" htmlFor="catalogue-standard">
            <select
              id="catalogue-standard"
              value={filters.standard}
              onChange={(e) => navigate({ standard: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All standards</option>
              {standards.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </CatalogueFilterGroup>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => navigate({ inStockOnly: e.target.checked, page: 1 })}
              className="rounded border-slate-300"
            />
            Available only
          </label>

          <CatalogueFilterGroup label="Availability" htmlFor="catalogue-availability">
            <select
              id="catalogue-availability"
              value={filters.availability}
              onChange={(e) => navigate({ availability: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="special_order">Special Order</option>
              <option value="made_to_order">Made To Order</option>
              <option value="out_of_stock">Request Availability</option>
            </select>
          </CatalogueFilterGroup>

          <CatalogueFilterToggle
            label="Marine Grade"
            checked={filters.marineGrade}
            onChange={(checked) => navigate({ marineGrade: checked, page: 1 })}
          />
          <CatalogueFilterToggle
            label="Industrial Grade"
            checked={filters.industrialGrade}
            onChange={(checked) => navigate({ industrialGrade: checked, page: 1 })}
          />
          <CatalogueFilterToggle
            label="Featured"
            checked={filters.featured}
            onChange={(checked) => navigate({ featured: checked, page: 1 })}
          />
          <CatalogueFilterToggle
            label="Fast Selling"
            checked={filters.fastSelling}
            onChange={(checked) => navigate({ fastSelling: checked, page: 1 })}
          />
          <CatalogueFilterToggle
            label="New Arrival"
            checked={filters.newArrival}
            onChange={(checked) => navigate({ newArrival: checked, page: 1 })}
          />
          <CatalogueFilterToggle
            label="Recently Added"
            checked={filters.recentlyAdded}
            onChange={(checked) => navigate({ recentlyAdded: checked, page: 1 })}
          />
        </aside>

        <div>
          <p className="mb-4 text-sm text-slate-600">
            {result.total} product{result.total !== 1 ? 's' : ''}
            {filters.query ? ` matching "${filters.query}"` : ''}
            {division ? ` in ${division}` : ''}
          </p>

          {result.products.length === 0 ? (
            <CatalogueEmptyState filtered />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {result.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={result.page === 1 && index < 4}
                />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={result.page <= 1}
                onClick={() => navigate({ page: result.page - 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-slate-700">
                Page {result.page} of {result.totalPages}
              </span>
              <button
                type="button"
                disabled={result.page >= result.totalPages}
                onClick={() => navigate({ page: result.page + 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

