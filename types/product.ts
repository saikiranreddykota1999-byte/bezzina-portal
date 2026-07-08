export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  parent_id?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  image_url: string | null;

  material: string | null;
  standard: string | null;
  thread_type: string | null;
  length_mm: number | null;
  diameter_mm: number | null;
  grade: string | null;

  price: number | null;
  unit: string;
  in_stock: boolean;
  stock_quantity: number | null;

  featured: boolean;
  fast_selling: boolean;
  upcoming: boolean;
  future_product: boolean;
  discount_percent: number | null;
  is_active: boolean;

  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;

  // populated via join
  category?: Category | null;
  brand?: Brand | null;
}

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'newest';

export type ProductFilters = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  inStockOnly?: boolean;
  material?: string;
  standard?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type PaginatedProducts = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
