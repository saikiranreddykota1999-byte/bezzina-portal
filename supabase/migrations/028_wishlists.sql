-- Wishlist persistence for signed-in customers
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  price NUMERIC(12,2),
  image_url TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_added
  ON wishlists(user_id, added_at DESC);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlists_own ON wishlists;
CREATE POLICY wishlists_own ON wishlists
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS wishlists_staff ON wishlists;
CREATE POLICY wishlists_staff ON wishlists
  FOR SELECT
  USING (public.is_staff());
