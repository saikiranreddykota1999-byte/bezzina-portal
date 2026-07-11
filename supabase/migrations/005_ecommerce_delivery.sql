-- Delivery address + payment fields on orders
-- Depends on: profiles + orders (created in 001_portal_schema.sql)
-- If you see "relation orders does not exist", run migrations in order:
--   1) 001_portal_schema.sql
--   2) 003_store_pickup.sql
--   3) this file (005)

-- ── Bootstrap base tables if earlier migrations were skipped ────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tracking_number TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Columns from 003_store_pickup.sql (safe if 003 was not run yet)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time TIME;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_code TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_status TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_fulfillment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_fulfillment_method_check
      CHECK (fulfillment_method IN ('delivery', 'store_pickup'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_pickup_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_pickup_status_check
      CHECK (
        pickup_status IS NULL
        OR pickup_status IN ('scheduled', 'ready_for_pickup', 'collected')
      );
  END IF;
END $$;

-- ── Delivery + payment columns (this migration) ─────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'Malta';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_lat NUMERIC(10, 7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_lng NUMERIC(10, 7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_formatted_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- payment_status: add column first, then attach check constraint separately
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- Default sell price for products without a price
UPDATE products SET price = 1.00 WHERE price IS NULL;
