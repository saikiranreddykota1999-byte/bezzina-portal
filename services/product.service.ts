import { supabase } from '@/lib/supabase';
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

const PRODUCT_SELECT = '*, category:categories(*), images:product_images(*), documents:product_documents(*), variants:product_variants(*)';
const PRODUCT_SELECT_FALLBACK = '*, category:categories(*)';

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

export async function getCategoriesByDivision(
  division: CategoryDivision,
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('division', division)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategoriesByDivision error:', error.message);
    const { data: fallback } = await supabase
      .from('categories')
      .select('*')
      .ilike('slug', `${division}%`)
      .order('sort_order', { ascending: true });
    return fallback ?? [];
  }
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategories error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getBrands(): Promise<Brand[]> {
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

async function fetchProducts(select: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(select)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as Product[]).map(normalizeProduct);
}

async function fetchProductsWithError(
  select: string,
): Promise<{ products: Product[]; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select(select)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    return { products: [], error: error.message };
  }

  return {
    products: ((data ?? []) as unknown as Product[]).map(normalizeProduct),
    error: null,
  };
}

export type CataloguePageData = {
  products: Product[];
  categories: Category[];
  error: string | null;
};

export async function getCataloguePageData(): Promise<CataloguePageData> {
  const primary = await fetchProductsWithError(PRODUCT_SELECT);
  let products = primary.products;
  let productError = primary.error;

  if (productError) {
    const fallback = await fetchProductsWithError(PRODUCT_SELECT_FALLBACK);
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
  try {
    return await fetchProducts(PRODUCT_SELECT);
  } catch (error) {
    console.error('getAllProducts error:', error);
    try {
      return await fetchProducts(PRODUCT_SELECT_FALLBACK);
    } catch {
      return [];
    }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
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
      .single();
    return data ? normalizeProduct(data as unknown as Product) : null;
  }
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
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
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
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
};

export async function getHomepageCategories(limit = 20): Promise<HomepageCategory[]> {
  const fallback = PRODUCT_CATEGORIES.slice(0, limit).map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
  }));

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name, slug, description')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error || !data?.length) {
      return fallback;
    }

    return data.map((category) => ({
      name: category.name,
      slug: category.slug,
      description: category.description?.trim() || `Browse ${category.name} products.`,
    }));
  } catch (error) {
    console.error('getHomepageCategories error:', error);
    return fallback;
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  try {
    if (product.related_product_ids?.length) {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('id', product.related_product_ids)
        .eq('is_active', true)
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
