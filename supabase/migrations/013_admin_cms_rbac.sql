-- Admin CMS + RBAC (Super Admin, Admin, Customer)
-- Run after existing migrations.

-- ── Roles: super_admin, admin, customer (migrate legacy staff → admin) ───────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
UPDATE profiles SET role = 'admin' WHERE role = 'staff';
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

-- ── Staff helpers ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_disabled = false
  );
$$;

-- ── Profiles RLS: staff can read/manage customers; super_admin manages admins ─

DROP POLICY IF EXISTS profiles_staff_select ON profiles;
CREATE POLICY profiles_staff_select ON profiles
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS profiles_staff_update_customers ON profiles;
CREATE POLICY profiles_staff_update_customers ON profiles
  FOR UPDATE
  USING (
    public.is_staff()
    AND (
      role = 'customer'
      OR id = auth.uid()
      OR public.is_super_admin()
    )
  )
  WITH CHECK (
    public.is_staff()
    AND (
      (role = 'customer' AND NOT public.is_super_admin())
      OR id = auth.uid()
      OR public.is_super_admin()
    )
  );

-- ── Product CMS fields ───────────────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS applications TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_keywords TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS related_product_ids UUID[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_publish_status_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_publish_status_check
      CHECK (publish_status IN ('draft', 'published'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS product_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'pdf'
    CHECK (doc_type IN ('pdf', 'datasheet', 'sds', 'manual', 'catalogue', 'other')),
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_documents_product_id ON product_documents(product_id);

ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_documents_public_read ON product_documents;
CREATE POLICY product_documents_public_read ON product_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_active = true AND p.publish_status = 'published'
    )
  );

DROP POLICY IF EXISTS product_documents_staff_all ON product_documents;
CREATE POLICY product_documents_staff_all ON product_documents
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Public read: published + active only
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (is_active = true AND publish_status = 'published');

-- ── Quote status expansion ───────────────────────────────────────────────────

ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_status_check;
ALTER TABLE quote_requests
  ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN (
    'pending', 'in_review', 'quoted', 'accepted', 'rejected', 'completed', 'expired',
    'reviewed', 'declined'
  ));

UPDATE quote_requests SET status = 'in_review' WHERE status = 'reviewed';
UPDATE quote_requests SET status = 'rejected' WHERE status = 'declined';

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ── Site settings (key-value) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_settings_public_read ON site_settings;
CREATE POLICY site_settings_public_read ON site_settings
  FOR SELECT USING (key IN ('company', 'social', 'business_hours'));

DROP POLICY IF EXISTS site_settings_staff_write ON site_settings;
CREATE POLICY site_settings_staff_write ON site_settings
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS site_settings_super_admin_sensitive ON site_settings;
CREATE POLICY site_settings_super_admin_sensitive ON site_settings
  FOR ALL USING (
    public.is_super_admin()
    OR key NOT IN ('backup', 'database', 'analytics')
  );

-- ── Homepage CMS sections ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS homepage_sections (
  section_key TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS homepage_sections_public_read ON homepage_sections;
CREATE POLICY homepage_sections_public_read ON homepage_sections
  FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS homepage_sections_staff_all ON homepage_sections;
CREATE POLICY homepage_sections_staff_all ON homepage_sections
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── SEO pages ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  schema_json JSONB DEFAULT '{}',
  robots TEXT DEFAULT 'index,follow',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS seo_pages_public_read ON seo_pages;
CREATE POLICY seo_pages_public_read ON seo_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS seo_pages_staff_all ON seo_pages;
CREATE POLICY seo_pages_staff_all ON seo_pages
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Media library ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder TEXT NOT NULL DEFAULT 'general',
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_assets_public_read ON media_assets;
CREATE POLICY media_assets_public_read ON media_assets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS media_assets_staff_all ON media_assets;
CREATE POLICY media_assets_staff_all ON media_assets
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Newsletter ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS newsletter_public_insert ON newsletter_subscribers;
CREATE POLICY newsletter_public_insert ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS newsletter_staff_all ON newsletter_subscribers;
CREATE POLICY newsletter_staff_all ON newsletter_subscribers
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Activity log (staff read) ──────────────────────────────────────────────────

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_logs_staff_read ON activity_logs;
CREATE POLICY activity_logs_staff_read ON activity_logs
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS activity_logs_staff_insert ON activity_logs;
CREATE POLICY activity_logs_staff_insert ON activity_logs
  FOR INSERT WITH CHECK (public.is_staff());

-- ── Seed default homepage sections ───────────────────────────────────────────

INSERT INTO homepage_sections (section_key, content) VALUES
  ('hero', '{"eyebrow":"Industrial & Marine Supplies","subtitle":"","primaryButtonLabel":"Browse Products","primaryButtonHref":"/products","secondaryButtonLabel":"Request a Quote","secondaryButtonHref":"/quote","features":[]}'),
  ('about', '{"title":"About Joseph Bezzina","body":""}'),
  ('services', '{"title":"Our Services","items":[]}'),
  ('why_choose', '{"title":"Why Choose Us","items":[]}'),
  ('contact', '{"title":"Contact Us","body":""}'),
  ('footer', '{"copyright":"","links":[]}')
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('company', '{"name":"Joseph Bezzina & Co. Ltd","email":"jason@jbezzina.com","phone":"+356 2122 6647","whatsapp":"+356 7757 6721","address":"5/6 Triq Aldo Moro, Il-Marsa MRS 9065, Malta"}'),
  ('social', '{"facebook":"https://www.facebook.com/JosephBezzina.Co.Ltd/","instagram":"","linkedin":""}'),
  ('business_hours', '{"monday":"08:00-17:00","tuesday":"08:00-17:00","wednesday":"08:00-17:00","thursday":"08:00-17:00","friday":"08:00-17:00","saturday":"Closed","sunday":"Closed"}')
ON CONFLICT (key) DO NOTHING;
