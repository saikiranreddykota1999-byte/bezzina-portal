export type CategoryDivision = 'marine' | 'industrial';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  parent_id?: string | null;
  division?: CategoryDivision | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_primary: boolean;
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
  images?: ProductImage[];
}

export type ProductFormData = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number | null;
  unit: string;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  material?: string;
  standard?: string;
};

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
  division?: CategoryDivision;
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
