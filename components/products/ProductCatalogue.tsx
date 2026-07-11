'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { Product, Category, SortOption, CategoryDivision } from '@/types/product';
import {
  filterProducts,
  getUniqueMaterials,
  getUniqueStandards,
} from '@/services/product.service';
import ProductCard from './ProductCard';
import { staggerContainer, fadeIn, defaultTransition } from '@/lib/motion';

interface Props {
  products: Product[];
  categories: Category[];
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

export default function ProductCatalogue({
  products,
  categories,
  division,
  title,
}: Props) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [material, setMaterial] = useState('all');
  const [standard, setStandard] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  const scopedCategories = useMemo(() => {
    if (!division) return categories.filter((c) => c.parent_id || c.slug.includes('-'));
    return categories.filter(
      (c) =>
        c.slug.startsWith(`${division}-`) &&
        !c.slug.endsWith('-supplies') &&
        !c.slug.endsWith('-equipment'),
    );
  }, [categories, division]);

  const scopedProducts = useMemo(() => {
    if (!division) return products;
    const divisionCategoryIds = new Set(
      categories
        .filter((c) => c.slug.startsWith(`${division}-`))
        .map((c) => c.id),
    );
    return products.filter(
      (p) => p.category_id && divisionCategoryIds.has(p.category_id),
    );
  }, [products, categories, division]);

  const resolvedCategoryId = useMemo(() => {
    if (categorySlug) {
      return scopedCategories.find((c) => c.slug === categorySlug)?.id ?? categoryId;
    }
    return categoryId;
  }, [categorySlug, scopedCategories, categoryId]);

  const materials = useMemo(() => getUniqueMaterials(scopedProducts), [scopedProducts]);
  const standards = useMemo(() => getUniqueStandards(scopedProducts), [scopedProducts]);

  const filterSignature = `${debouncedQuery}|${resolvedCategoryId}|${material}|${standard}|${inStockOnly}|${sort}|${division}`;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const [pageByFilter, setPageByFilter] = useState({ signature: filterSignature, page: 1 });
  const page = pageByFilter.signature === filterSignature ? pageByFilter.page : 1;

  const setPage = (next: number | ((p: number) => number)) => {
    setPageByFilter((prev) => {
      const currentPage = prev.signature === filterSignature ? prev.page : 1;
      const newPage = typeof next === 'function' ? next(currentPage) : next;
      return { signature: filterSignature, page: newPage };
    });
  };

  const result = useMemo(
    () =>
      filterProducts(scopedProducts, {
        query: debouncedQuery,
        categoryId: resolvedCategoryId,
        material,
        standard,
        inStockOnly,
        sort,
        page,
        pageSize: 24,
      }),
    [scopedProducts, debouncedQuery, resolvedCategoryId, material, standard, inStockOnly, sort, page],
  );

  return (
    <div>
      {title && (
        <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU, specs, tags..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterGroup label="Subcategory">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All subcategories</option>
              {scopedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Material">
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Standard">
            <select
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="all">All standards</option>
              {standards.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FilterGroup>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            In stock only
          </label>
        </aside>

        <div>
          <p className="mb-4 text-sm text-slate-600">
            {result.total} product{result.total !== 1 ? 's' : ''}
            {debouncedQuery ? ` matching "${debouncedQuery}"` : ''}
          </p>

          {result.products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-slate-600"
            >
              No products match your filters.
            </motion.div>
          ) : (
            <motion.div
              key={`${resolvedCategoryId}-${page}-${debouncedQuery}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {result.products.map((product, i) => (
                  <motion.div key={product.id} variants={fadeIn} transition={{ ...defaultTransition, delay: i * 0.02 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-slate-700">
                Page {result.page} of {result.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= result.totalPages}
                onClick={() => setPage((p) => p + 1)}
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      {children}
    </div>
  );
}
