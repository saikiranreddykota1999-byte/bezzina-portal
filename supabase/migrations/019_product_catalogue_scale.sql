-- Scale indexes for large industrial product catalogue (100k+ products)

CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products (lower(name));
CREATE INDEX IF NOT EXISTS idx_products_availability ON products (availability);
CREATE INDEX IF NOT EXISTS idx_products_marine_grade ON products (marine_grade) WHERE marine_grade = true;
CREATE INDEX IF NOT EXISTS idx_products_industrial_grade ON products (industrial_grade) WHERE industrial_grade = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_fast_selling ON products (fast_selling) WHERE fast_selling = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products (new_arrival) WHERE new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_recently_added ON products (recently_added) WHERE recently_added = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants (sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_name_lower ON product_variants (lower(name));

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories (parent_id);

-- Full-text search across product catalogue fields
CREATE INDEX IF NOT EXISTS idx_products_search_fts ON products USING gin (
  to_tsvector(
    'english',
    coalesce(name, '') || ' ' ||
    coalesce(sku, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(search_keywords, '') || ' ' ||
    coalesce(material, '') || ' ' ||
    coalesce(standard, '')
  )
);
