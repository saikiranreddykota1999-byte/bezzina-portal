import { createClient } from '@/lib/supabase/server';
import { PRODUCT_CATEGORIES } from '@/config/categories';
import {
  Product,
  Category,
  Brand,
  CategoryDivision,
  ProductImage,
} from '@/types/product';
import {
  filterProducts,
  getUniqueMaterials,
  getUniqueStandards,
} from '@/lib/catalogue-filters';

export { filterProducts, getUniqueMaterials, getUniqueStandards };

type DbClient = Awaited<ReturnType<typeof createClient>>;

const PRODUCT_PUBLIC_SELECT =
  'id, sku, name, slug, description, category_id, brand_id, image_url, material, standard, thread_type, length_mm, diameter_mm, grade, price, unit, in_stock, stock_quantity, featured, fast_selling, upcoming, future_product, new_arrival, clearance, recommended, marine_grade, industrial_grade, best_seller, most_viewed, recently_added, discount_percent, is_active, video_url, youtube_url, weight_kg, view_count, technical_specs, tags, seo_title, seo_description, long_description, applications, availability, publish_status, related_product_ids, created_at, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*)';
const PRODUCT_SELECT = PRODUCT_PUBLIC_SELECT;
const PRODUCT_SELECT_FALLBACK = 'id, sku, name, slug, description, category_id, brand_id, image_url, material, standard, price, unit, in_stock, featured, is_active, publish_status, category:categories(*)';

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

  return {
    ...product,
    image_url: normalizeImageUrl(primaryImage?.url ?? product.image_url),
    images,
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
  const { data, error } = await supabase
    .from('products')
    .select(select)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    return { products: [], error: error.message };
  }

  return {
    products: ((data ?? []) as unknown as Product[]).map(normalizeProduct),
    error: null,
  };
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

export async function getCategories(): Promise<Category[]> {
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
}

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

export async function getCataloguePageData(): Promise<CataloguePageData> {
  const supabase = await createClient();
  const primary = await fetchProductsWithError(supabase, PRODUCT_SELECT);
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
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  try {
    return await fetchProducts(supabase, PRODUCT_SELECT);
  } catch (error) {
    console.error('getAllProducts error:', error);
    try {
      return await fetchProducts(supabase, PRODUCT_SELECT_FALLBACK);
    } catch {
      return [];
    }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
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
    return data ? normalizeProduct(data as unknown as Product) : null;
  } catch (error) {
    console.error('getProductBySlug error:', error);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();
    return data ? normalizeProduct(data as unknown as Product) : null;
  }
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
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
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(Math.max(limit * 4, 48));

    if (error) throw error;

    const products = ((data ?? []) as unknown as Product[]).map(normalizeProduct);
    return shuffleProducts(products).slice(0, limit);
  } catch (error) {
    console.error('getRandomProducts error:', error);
    try {
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_SELECT_FALLBACK)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(Math.max(limit * 4, 48));

      const products = ((data ?? []) as unknown as Product[]).map(normalizeProduct);
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

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  try {
    if (product.related_product_ids?.length) {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('id', product.related_product_ids)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(limit);

      if (!error && data?.length) {
        return (data as unknown as Product[]).map(normalizeProduct);
      }
    }

    if (product.category_id) {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
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
