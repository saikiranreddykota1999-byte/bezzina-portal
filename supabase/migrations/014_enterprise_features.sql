-- Enterprise B2B features: variants, notifications, activity audit, storage buckets

-- ── Product feature flags & media ────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS clearance BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS recommended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS marine_grade BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS industrial_grade BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS most_viewed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS recently_added BOOLEAN NOT NULL DEFAULT false;

-- Normalize availability values
UPDATE products SET availability = 'available' WHERE availability = 'in_stock' OR availability IS NULL;

-- ── Product variants ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available',
  unit TEXT NOT NULL DEFAULT 'each',
  weight_kg NUMERIC(10,3),
  specification TEXT,
  image_url TEXT,
  document_url TEXT,
  document_label TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(12,2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_variants_public_read ON product_variants;
CREATE POLICY product_variants_public_read ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_active = true AND p.publish_status = 'published'
    )
  );

DROP POLICY IF EXISTS product_variants_staff_all ON product_variants;
CREATE POLICY product_variants_staff_all ON product_variants
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Activity log audit fields ────────────────────────────────────────────────

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS old_value JSONB;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS new_value JSONB;

-- ── Notifications ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_own_read ON notifications;
CREATE POLICY notifications_own_read ON notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS notifications_own_update ON notifications;
CREATE POLICY notifications_own_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_staff_insert ON notifications;
CREATE POLICY notifications_staff_insert ON notifications
  FOR INSERT WITH CHECK (public.is_staff() OR user_id = auth.uid());

-- ── Quote workflow expansion ─────────────────────────────────────────────────

ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_status_check;
ALTER TABLE quote_requests
  ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN (
    'pending', 'in_review', 'waiting_customer', 'quoted', 'approved',
    'accepted', 'rejected', 'completed', 'cancelled', 'expired'
  ));

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]';

-- ── Career application enhancements ──────────────────────────────────────────

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;

ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_status_check
  CHECK (status IN (
    'received', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'
  ));

-- ── Customer addresses ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Primary',
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Malta',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_addresses_own ON user_addresses;
CREATE POLICY user_addresses_own ON user_addresses
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Recently viewed products ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);

ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_views_insert ON product_views;
CREATE POLICY product_views_insert ON product_views
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS product_views_own_read ON product_views;
CREATE POLICY product_views_own_read ON product_views
  FOR SELECT USING (user_id = auth.uid() OR public.is_staff());

-- ── Quote drafts (saved quotes) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quote_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Draft Quote',
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_drafts_user_id ON quote_drafts(user_id);

ALTER TABLE quote_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_drafts_own ON quote_drafts;
CREATE POLICY quote_drafts_own ON quote_drafts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Storage buckets ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('media-library', 'media-library', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4']),
  ('product-documents', 'product-documents', true, 20971520, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media-library
DROP POLICY IF EXISTS media_library_public_read ON storage.objects;
CREATE POLICY media_library_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'media-library');

DROP POLICY IF EXISTS media_library_staff_write ON storage.objects;
CREATE POLICY media_library_staff_write ON storage.objects
  FOR ALL USING (bucket_id = 'media-library' AND public.is_staff())
  WITH CHECK (bucket_id = 'media-library' AND public.is_staff());

-- Storage policies for product-documents
DROP POLICY IF EXISTS product_documents_public_read ON storage.objects;
CREATE POLICY product_documents_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'product-documents');

DROP POLICY IF EXISTS product_documents_staff_write ON storage.objects;
CREATE POLICY product_documents_staff_write ON storage.objects
  FOR ALL USING (bucket_id = 'product-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'product-documents' AND public.is_staff());
