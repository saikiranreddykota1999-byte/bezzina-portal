import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { PRODUCT_CATEGORIES } from '@/config/categories';
import {
  Product,
  Category,
  Brand,
  CategoryDivision,
  ProductImage,
  Product360Frame,
  ProductRelationType,
  WarehouseAvailabilityRow,
} from '@/types/product';
import {
  filterProducts,
  getUniqueMaterials,
  getUniqueStandards,
} from '@/lib/catalogue-filters';

export { filterProducts, getUniqueMaterials, getUniqueStandards };

type DbClient = Awaited<ReturnType<typeof createClient>>;

/** Full product graph — detail pages / admin-style needs. */
const PRODUCT_DETAIL_SELECT =
  'id, sku, name, slug, description, category_id, brand_id, image_url, material, standard, thread_type, length_mm, diameter_mm, grade, price, unit, in_stock, stock_quantity, featured, fast_selling, upcoming, future_product, new_arrival, clearance, recommended, marine_grade, industrial_grade, best_seller, most_viewed, recently_added, discount_percent, is_active, video_url, youtube_url, weight_kg, view_count, technical_specs, tags, seo_title, seo_description, long_description, applications, availability, publish_status, related_product_ids, search_keywords, created_at, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*), spin_frames:product_360_frames(*)';

const PRODUCT_DETAIL_SELECT_FALLBACK =
  'id, sku, name, slug, description, category_id, brand_id, image_url, material, standard, thread_type, length_mm, diameter_mm, grade, price, unit, in_stock, stock_quantity, featured, fast_selling, upcoming, future_product, new_arrival, clearance, recommended, marine_grade, industrial_grade, best_seller, most_viewed, recently_added, discount_percent, is_active, video_url, youtube_url, weight_kg, view_count, technical_specs, tags, seo_title, seo_description, long_description, applications, availability, publish_status, related_product_ids, search_keywords, created_at, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*)';

/**
 * Lean list select for catalogue browsing/filtering.
 * Avoids documents + full image galleries on every row.
 */
const PRODUCT_LIST_SELECT =
  'id, sku, name, slug, description, category_id, brand_id, image_url, material, standard, thread_type, price, unit, in_stock, stock_quantity, featured, fast_selling, upcoming, future_product, new_arrival, clearance, recommended, marine_grade, industrial_grade, best_seller, most_viewed, recently_added, discount_percent, is_active, availability, publish_status, search_keywords, tags, technical_specs, created_at, category:categories(id, name, slug, parent_id, division), brand:brands(id, name), variants:product_variants(id, name, sku, specification)';

const PRODUCT_SEARCH_SELECT =
  'id, sku, name, slug, description, image_url, price, unit, in_stock, availability, search_keywords, tags, material, standard, thread_type, is_active, category:categories(id, name), brand:brands(id, name), variants:product_variants(id, name, sku, specification)';

const PRODUCT_SELECT = PRODUCT_DETAIL_SELECT;
const PRODUCT_SELECT_FALLBACK = PRODUCT_DETAIL_SELECT_FALLBACK;

function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes('YOUR_PROJECT_REF')) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return url;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  return url.replace(/YOUR_PROJECT_REF/gi, projectRef);
}

function normalizeProduct(product: Product): Product {
  const images = (product.images ?? []).sort(
    (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order,
  );
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const spin_frames = [...(product.spin_frames ?? [])].sort(
    (a: Product360Frame, b: Product360Frame) => a.sort_order - b.sort_order,
  );

  return {
    ...product,
    image_url: normalizeImageUrl(primaryImage?.url ?? product.image_url),
    images,
    spin_frames,
    fast_selling: product.fast_selling ?? false,
    upcoming: product.upcoming ?? false,
    future_product: product.future_product ?? false,
    new_arrival: product.new_arrival ?? false,
    clearance: product.clearance ?? false,
    recommended: product.recommended ?? false,
    marine_grade: product.marine_grade ?? false,
    industrial_grade: product.industrial_grade ?? false,
    best_seller: product.best_seller ?? false,
    most_viewed: product.most_viewed ?? false,
    recently_added: product.recently_added ?? false,
    tags: product.tags ?? null,
  };
}

async function fetchProducts(supabase: DbClient, select: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(select)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as Product[]).map(normalizeProduct);
}

async function fetchProductsWithError(
  supabase: DbClient,
  select: string,
): Promise<{ products: Product[]; error: string | null }> {
  try {
    const products = await fetchProducts(supabase, select);
    return { products, error: null };
  } catch (error) {
    return {
      products: [],
      error: error instanceof Error ? error.message : 'Failed to load products',
    };
  }
}

export async function getCategoriesByDivision(
  division: CategoryDivision,
): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('division', division)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategoriesByDivision error:', error.message);
    const { data: fallback } = await supabase
      .from('categories')
      .select('*')
      .ilike('slug', `${division}%`)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    return fallback ?? [];
  }
  return data ?? [];
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategories error:', error.message);
    return [];
  }
  return data ?? [];
});

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('getBrands error:', error.message);
    return [];
  }
  return data ?? [];
}

export type CataloguePageData = {
  products: Product[];
  categories: Category[];
  error: string | null;
};

/** Request-deduped catalogue payload for listing/filter UIs. */
export const getCataloguePageData = cache(async (): Promise<CataloguePageData> => {
  const supabase = await createClient();
  const primary = await fetchProductsWithError(supabase, PRODUCT_LIST_SELECT);
  let products = primary.products;
  let productError = primary.error;

  if (productError) {
    const fallback = await fetchProductsWithError(supabase, PRODUCT_SELECT_FALLBACK);
    products = fallback.products;
    productError = fallback.error ?? productError;
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error('getCategories error:', categoriesError.message);
  }

  const error = productError
    ? `Could not load products. ${productError}`
    : categoriesError
      ? `Could not load categories. ${categoriesError.message}`
      : null;

  return {
    products,
    categories: categories ?? [],
    error,
  };
});

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  try {
    return await fetchProducts(supabase, PRODUCT_LIST_SELECT);
  } catch (error) {
    console.error('getAllProducts error:', error);
    try {
      return await fetchProducts(supabase, PRODUCT_SELECT_FALLBACK);
    } catch {
      return [];
    }
  }
}

/**
 * Lean DB-backed search candidates for header quick search.
 * Still ranked/trimmed by `quickSearchProducts` for identical hit shape.
 */
export async function searchProductsForQuery(
  query: string,
  limit = 40,
): Promise<{ products: Product[]; error: string | null }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { products: [], error: null };
  }

  const supabase = await createClient();
  const escaped = trimmed.replace(/[%_,]/g, '');
  if (!escaped) {
    return { products: [], error: null };
  }

  const pattern = `%${escaped}%`;

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SEARCH_SELECT)
      .eq('is_active', true)
      .is('deleted_at', null)
      .or(
        [
          `name.ilike."${pattern}"`,
          `sku.ilike."${pattern}"`,
          `search_keywords.ilike."${pattern}"`,
          `description.ilike."${pattern}"`,
        ].join(','),
      )
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      return { products: [], error: error.message };
    }

    return {
      products: ((data ?? []) as unknown as Product[]).map(normalizeProduct),
      error: null,
    };
  } catch (error) {
    return {
      products: [],
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    if (!data) return null;
    const product = normalizeProduct(data as unknown as Product);
    const warehouse_availability = await getStorefrontWarehouseAvailability(product.id);
    return { ...product, warehouse_availability };
  } catch (error) {
    console.error('getProductBySlug error:', error);
    const { data } = await supabase
      .from('products')
      .select(PRODUCT_SELECT_FALLBACK)
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();
    if (!data) return null;
    const product = normalizeProduct(data as unknown as Product);
    const warehouse_availability = await getStorefrontWarehouseAvailability(product.id);
    return { ...product, warehouse_availability };
  }
});

async function fetchProductsByIdsPreservingOrder(
  ids: string[],
  limit: number,
): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .in('id', ids)
    .eq('is_active', true)
    .is('deleted_at', null)
    .limit(limit);

  if (error || !data?.length) return [];
  const byId = new Map(
    (data as unknown as Product[]).map((p) => [p.id, normalizeProduct(p)]),
  );
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)).slice(0, limit);
}

export async function getProductRelations(
  productId: string,
  relationType: ProductRelationType,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();
  try {
    const { data: rows, error } = await supabase
      .from('product_relations')
      .select('related_product_id, sort_order')
      .eq('product_id', productId)
      .eq('relation_type', relationType)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (!error && rows?.length) {
      const ids = rows.map((r) => r.related_product_id as string);
      return fetchProductsByIdsPreservingOrder(ids, limit);
    }
  } catch (error) {
    console.error('getProductRelations error:', error);
  }
  return [];
}

export async function getStorefrontWarehouseAvailability(
  productId: string,
): Promise<WarehouseAvailabilityRow[]> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('inventory_levels')
      .select('available_stock, warehouse:warehouses(id, name, is_active)')
      .eq('product_id', productId)
      .gt('available_stock', 0);

    if (error || !data?.length) return [];

    const rows: WarehouseAvailabilityRow[] = [];
    for (const level of data) {
      const warehouse = level.warehouse as
        | { id: string; name: string; is_active: boolean }
        | { id: string; name: string; is_active: boolean }[]
        | null;
      const wh = Array.isArray(warehouse) ? warehouse[0] : warehouse;
      if (!wh || wh.is_active === false) continue;
      const qty = Number(level.available_stock) || 0;
      rows.push({
        warehouseId: wh.id,
        warehouseName: wh.name,
        stockBand: qty <= 5 ? 'limited' : 'in_stock',
      });
    }
    return rows.sort((a, b) => a.warehouseName.localeCompare(b.warehouseName));
  } catch (error) {
    console.error('getStorefrontWarehouseAvailability error:', error);
    return [];
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  try {
    const fromRelations = await getProductRelations(product.id, 'related', limit);
    if (fromRelations.length > 0) return fromRelations;

    if (product.related_product_ids?.length) {
      const ordered = await fetchProductsByIdsPreservingOrder(
        product.related_product_ids,
        limit,
      );
      if (ordered.length) return ordered;
    }

    if (product.category_id) {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_LIST_SELECT)
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .neq('id', product.id)
        .limit(limit);

      if (!error && data?.length) {
        return (data as unknown as Product[]).map(normalizeProduct);
      }
    }

    const random = await getRandomProducts(limit);
    return random.filter((item) => item.id !== product.id).slice(0, limit);
  } catch (error) {
    console.error('getRelatedProducts error:', error);
    return [];
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return fetchProductsByIdsPreservingOrder(ids, ids.length);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('is_active', true)
      .is('deleted_at', null)
      .eq('featured', true)
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as unknown as Product[]).map(normalizeProduct);
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    return [];
  }
}

function shuffleProducts<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function getRandomProducts(limit = 12): Promise<Product[]> {
  const supabase = await createClient();
  const poolSize = Math.max(limit * 2, 24);
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('is_active', true)
      .is('deleted_at', null)
      .not('image_url', 'is', null)
      .limit(poolSize);

    if (error) throw error;

    const products = ((data ?? []) as unknown as Product[])
      .map(normalizeProduct)
      .filter((product) => Boolean(product.image_url));
    return shuffleProducts(products).slice(0, limit);
  } catch (error) {
    console.error('getRandomProducts error:', error);
    try {
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_SELECT_FALLBACK)
        .eq('is_active', true)
        .is('deleted_at', null)
        .not('image_url', 'is', null)
        .limit(poolSize);

      const products = ((data ?? []) as unknown as Product[])
        .map(normalizeProduct)
        .filter((product) => Boolean(product.image_url));
      return shuffleProducts(products).slice(0, limit);
    } catch {
      return [];
    }
  }
}

export type HomepageCategory = {
  name: string;
  slug: string;
  description: string;
  division?: string | null;
};

export async function getHomepageCategories(limit = 20): Promise<HomepageCategory[]> {
  const fallback = PRODUCT_CATEGORIES.slice(0, limit).map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    division: null,
  }));

  const supabase = await createClient();
  try {
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('name, slug, description, division')
      .not('parent_id', 'is', null)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (!subError && subcategories?.length) {
      return subcategories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description?.trim() || `Browse ${category.name} products.`,
        division: category.division,
      }));
    }

    const { data, error } = await supabase
      .from('categories')
      .select('name, slug, description, division')
      .is('parent_id', null)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error || !data?.length) {
      return fallback;
    }

    return data.map((category) => ({
      name: category.name,
      slug: category.slug,
      description: category.description?.trim() || `Browse ${category.name} products.`,
      division: category.division,
    }));
  } catch (error) {
    console.error('getHomepageCategories error:', error);
    return fallback;
  }
}
