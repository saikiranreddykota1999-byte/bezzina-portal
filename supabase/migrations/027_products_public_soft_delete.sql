-- Soft-delete must exclude products (and soft-deleted categories) from public reads.

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (
    is_active = true
    AND publish_status = 'published'
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories
  FOR SELECT USING (deleted_at IS NULL);
