-- Feature pack: catalogues, quotes, careers, product images, RLS, storage

-- Category division (marine | industrial)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS division TEXT
  CHECK (division IS NULL OR division IN ('marine', 'industrial'));

-- Product gallery images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Quote requests (extensible toward orders)
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'declined', 'expired')),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  company_name TEXT,
  notes TEXT,
  channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp', 'email')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit TEXT DEFAULT 'each',
  unit_price NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_items_quote_id ON quote_request_items(quote_request_id);

-- Careers
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Malta',
  description TEXT NOT NULL,
  requirements TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  cover_letter TEXT,
  cv_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Login rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);

-- Staff helper (reuse from pickup migration if exists)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS: products (public read active, staff write)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS products_staff_all ON products;
CREATE POLICY products_staff_all ON products
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- RLS: categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS categories_staff_all ON categories;
CREATE POLICY categories_staff_all ON categories
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- RLS: product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_images_public_read ON product_images;
CREATE POLICY product_images_public_read ON product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS product_images_staff_all ON product_images;
CREATE POLICY product_images_staff_all ON product_images
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- RLS: quote_requests
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_requests_owner_read ON quote_requests;
CREATE POLICY quote_requests_owner_read ON quote_requests
  FOR SELECT USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS quote_requests_insert ON quote_requests;
CREATE POLICY quote_requests_insert ON quote_requests
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS quote_requests_staff_all ON quote_requests;
CREATE POLICY quote_requests_staff_all ON quote_requests
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- RLS: quote_request_items
ALTER TABLE quote_request_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_items_via_quote ON quote_request_items;
CREATE POLICY quote_items_via_quote ON quote_request_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quote_requests q
      WHERE q.id = quote_request_id
        AND (q.user_id = auth.uid() OR public.is_staff() OR q.user_id IS NULL)
    )
  );

-- RLS: job_postings
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_postings_public_read ON job_postings;
CREATE POLICY job_postings_public_read ON job_postings
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS job_postings_staff_all ON job_postings;
CREATE POLICY job_postings_staff_all ON job_postings
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- RLS: job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_applications_insert ON job_applications;
CREATE POLICY job_applications_insert ON job_applications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS job_applications_staff_read ON job_applications;
CREATE POLICY job_applications_staff_read ON job_applications
  FOR SELECT USING (public.is_staff());

-- Storage buckets (run in Supabase dashboard if SQL insert fails)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('career-documents', 'career-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS product_images_public_read ON storage.objects;
CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS product_images_staff_upload ON storage.objects;
CREATE POLICY product_images_staff_upload ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_staff());

DROP POLICY IF EXISTS product_images_staff_update ON storage.objects;
CREATE POLICY product_images_staff_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND public.is_staff());

DROP POLICY IF EXISTS product_images_staff_delete ON storage.objects;
CREATE POLICY product_images_staff_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND public.is_staff());

DROP POLICY IF EXISTS career_docs_staff_read ON storage.objects;
CREATE POLICY career_docs_staff_read ON storage.objects
  FOR SELECT USING (bucket_id = 'career-documents' AND public.is_staff());

DROP POLICY IF EXISTS career_docs_public_upload ON storage.objects;
CREATE POLICY career_docs_public_upload ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'career-documents');
