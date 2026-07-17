-- Product system upgrade: relations (related/accessory/fbt) + 360° frames
-- Backward compatible: optional tables; soft-backfill related_product_ids; no column drops.

-- ── product_relations ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL
    CHECK (relation_type IN ('related', 'accessory', 'fbt')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT product_relations_no_self CHECK (product_id <> related_product_id),
  CONSTRAINT product_relations_unique UNIQUE (product_id, related_product_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_product_relations_product_type
  ON product_relations(product_id, relation_type, sort_order);

CREATE INDEX IF NOT EXISTS idx_product_relations_related
  ON product_relations(related_product_id);

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_relations_public_read ON product_relations;
CREATE POLICY product_relations_public_read ON product_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
        AND p.is_active = true
        AND p.publish_status = 'published'
        AND p.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS product_relations_staff_all ON product_relations;
CREATE POLICY product_relations_staff_all ON product_relations
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Soft backfill from legacy related_product_ids (idempotent)
INSERT INTO product_relations (product_id, related_product_id, relation_type, sort_order)
SELECT
  p.id,
  related_id,
  'related',
  ordinality::integer - 1
FROM products p
CROSS JOIN LATERAL unnest(COALESCE(p.related_product_ids, ARRAY[]::uuid[]))
  WITH ORDINALITY AS u(related_id, ordinality)
WHERE p.related_product_ids IS NOT NULL
  AND cardinality(p.related_product_ids) > 0
  AND related_id IS NOT NULL
  AND related_id <> p.id
ON CONFLICT (product_id, related_product_id, relation_type) DO NOTHING;

-- ── product_360_frames ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_360_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_360_frames_product
  ON product_360_frames(product_id, sort_order);

ALTER TABLE product_360_frames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_360_frames_public_read ON product_360_frames;
CREATE POLICY product_360_frames_public_read ON product_360_frames
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
        AND p.is_active = true
        AND p.publish_status = 'published'
        AND p.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS product_360_frames_staff_all ON product_360_frames;
CREATE POLICY product_360_frames_staff_all ON product_360_frames
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Quote line optional variant columns (additive)
ALTER TABLE quote_request_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE quote_request_items
  ADD COLUMN IF NOT EXISTS variant_sku TEXT;
ALTER TABLE quote_request_items
  ADD COLUMN IF NOT EXISTS variant_name TEXT;
