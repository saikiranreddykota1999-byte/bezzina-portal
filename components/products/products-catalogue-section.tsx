import ProductCatalogue from '@/components/products/ProductCatalogue';
import { CatalogueLoadError } from '@/components/products/catalogue-load-error';
import { CatalogueEmptyState } from '@/components/products/catalogue-empty-state';
import {
  filterProducts,
  filterProductsByParentCategory,
  getUniqueMaterials,
  getUniqueStandards,
  scopeParentCategories,
  scopeProductsForDivision,
  scopeSubcategoriesForDivision,
} from '@/lib/catalogue-filters';
import { parseCatalogueParams, type CatalogueSearchParams } from '@/lib/catalogue-params';
import { getCataloguePageData } from '@/services/product.service';
import { CategoryDivision } from '@/types/product';

type Props = {
  searchParams: Promise<CatalogueSearchParams>;
  division?: CategoryDivision;
};

export async function ProductsCatalogueSection({ searchParams, division }: Props) {
  const rawParams = await searchParams;
  const filters = parseCatalogueParams(rawParams);
  const { products, categories, error } = await getCataloguePageData();

  if (error) {
    return <CatalogueLoadError message={error} />;
  }

  const parentCategories = scopeParentCategories(categories, division);
  const subcategories = scopeSubcategoriesForDivision(categories, division);
  const scopedProducts = scopeProductsForDivision(products, categories, division);

  if (scopedProducts.length === 0) {
    return <CatalogueEmptyState />;
  }

  const activeParentSlug =
    filters.parentSlug ??
    (filters.categorySlug
      ? parentCategories.find((parent) =>
          subcategories.some(
            (sub) => sub.slug === filters.categorySlug && sub.parent_id === parent.id,
          ),
        )?.slug ?? null
      : null);

  const visibleSubcategories = activeParentSlug
    ? subcategories.filter((sub) => {
        const parent = parentCategories.find((p) => p.slug === activeParentSlug);
        return parent ? sub.parent_id === parent.id : true;
      })
    : subcategories;

  const productsToFilter = filterProductsByParentCategory(
    scopedProducts,
    categories,
    filters.categorySlug ? null : activeParentSlug,
  );

  const categoryId = filters.categorySlug
    ? visibleSubcategories.find((c) => c.slug === filters.categorySlug)?.id ?? 'all'
    : 'all';

  const result = filterProducts(productsToFilter, {
    query: filters.query,
    categoryId,
    material: filters.material,
    standard: filters.standard,
    inStockOnly: filters.inStockOnly,
    sort: filters.sort,
    page: filters.page,
    pageSize: 24,
  });

  return (
    <ProductCatalogue
      result={result}
      subcategories={visibleSubcategories}
      parentCategories={parentCategories}
      materials={getUniqueMaterials(scopedProducts)}
      standards={getUniqueStandards(scopedProducts)}
      filters={{ ...filters, parentSlug: activeParentSlug }}
      division={division}
    />
  );
}
