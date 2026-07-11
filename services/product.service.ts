import { supabase } from '@/lib/supabase';
import {
  Product,
  Category,
  Brand,
  ProductFilters,
  PaginatedProducts,
  SortOption,
  CategoryDivision,
  ProductImage,
} from '@/types/product';

const PRODUCT_SELECT = '*, category:categories(*), images:product_images(*)';
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

    if (q) {
      const haystack = [
        p.name,
        p.sku,
        p.description,
        p.thread_type,
        p.material,
        p.standard,
        p.category?.name,
        ...(p.tags ?? []),
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
