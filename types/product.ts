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

export type ProductRelationType = 'related' | 'accessory' | 'fbt';

export interface ProductRelation {
  id: string;
  product_id: string;
  related_product_id: string;
  relation_type: ProductRelationType;
  sort_order: number;
}

export interface Product360Frame {
  id: string;
  product_id: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

/** Storefront-safe stock projection — never expose exact on-hand quantities. */
export type WarehouseStockBand = 'limited' | 'in_stock';

export type WarehouseAvailabilityRow = {
  warehouseId: string;
  warehouseName: string;
  stockBand: WarehouseStockBand;
};

export type InventoryStatus =
  | 'available'
  | 'limited_stock'
  | 'special_order'
  | 'made_to_order'
  | 'coming_soon'
  | 'discontinued'
  | 'out_of_stock';

export type ProductDocumentType =
  | 'pdf'
  | 'datasheet'
  | 'sds'
  | 'manual'
  | 'catalogue'
  | 'other';

export interface ProductDocument {
  id: string;
  product_id: string;
  label: string;
  doc_type: ProductDocumentType;
  url: string;
  file_name: string;
  file_size: number | null;
  sort_order: number;
}

export type TechnicalSpecRow = { property: string; value: string };

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  availability: InventoryStatus;
  unit: string;
  weight_kg: number | null;
  specification: string | null;
  image_url: string | null;
  document_url: string | null;
  document_label: string | null;
  in_stock: boolean;
  stock_quantity: number;
  price: number | null;
  sort_order: number;
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
  new_arrival?: boolean;
  clearance?: boolean;
  recommended?: boolean;
  marine_grade?: boolean;
  industrial_grade?: boolean;
  best_seller?: boolean;
  most_viewed?: boolean;
  recently_added?: boolean;
  discount_percent: number | null;
  is_active: boolean;
  video_url?: string | null;
  youtube_url?: string | null;
  weight_kg?: number | null;
  view_count?: number;
  technical_specs?: TechnicalSpecRow[] | Record<string, string> | null;

  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;

  long_description?: string | null;
  applications?: string | null;
  availability?: InventoryStatus | string | null;
  internal_notes?: string | null;
  search_keywords?: string | null;
  publish_status?: 'draft' | 'published';
  related_product_ids?: string[] | null;

  created_at?: string | null;
  updated_at?: string | null;

  // populated via join / service
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
  documents?: ProductDocument[];
  variants?: ProductVariant[];
  spin_frames?: Product360Frame[];
  warehouse_availability?: WarehouseAvailabilityRow[];
}

export const INVENTORY_STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'limited_stock', label: 'Limited Stock' },
  { value: 'special_order', label: 'Special Order' },
  { value: 'made_to_order', label: 'Made To Order' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export const PRODUCT_FEATURE_FLAGS = [
  { key: 'featured', label: 'Featured Product' },
  { key: 'fast_selling', label: 'Fast Selling' },
  { key: 'new_arrival', label: 'New Arrival' },
  { key: 'upcoming', label: 'Upcoming Product' },
  { key: 'clearance', label: 'Clearance' },
  { key: 'recommended', label: 'Recommended' },
  { key: 'marine_grade', label: 'Marine Grade' },
  { key: 'industrial_grade', label: 'Industrial Grade' },
  { key: 'best_seller', label: 'Best Seller' },
  { key: 'most_viewed', label: 'Most Viewed' },
  { key: 'recently_added', label: 'Recently Added' },
] as const;

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
  availability?: string;
  marineGrade?: boolean;
  industrialGrade?: boolean;
  featured?: boolean;
  fastSelling?: boolean;
  newArrival?: boolean;
  recentlyAdded?: boolean;
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
