-- Enterprise Order Management System (OMS)
-- Extends existing orders/products schema without breaking checkout.

-- ── Roles ────────────────────────────────────────────────────────────────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'customer',
    'admin',
    'super_admin',
    'sales_manager',
    'salesman',
    'warehouse_manager',
    'warehouse_staff',
    'delivery_driver'
  ));

-- ── Role helpers ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles
  WHERE id = auth.uid() AND is_disabled = false
  LIMIT 1;
$$;

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
      AND role IN ('admin', 'super_admin', 'sales_manager')
      AND is_disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_oms_portal_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN (
        'admin', 'super_admin', 'sales_manager', 'salesman',
        'warehouse_manager', 'warehouse_staff', 'delivery_driver'
      )
      AND is_disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_warehouse_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('warehouse_manager', 'warehouse_staff', 'admin', 'super_admin')
      AND is_disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_sales_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('salesman', 'sales_manager', 'admin', 'super_admin')
      AND is_disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_delivery_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('delivery_driver', 'admin', 'super_admin')
      AND is_disabled = false
  );
$$;

-- ── Warehouses ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  line1 TEXT,
  city TEXT DEFAULT 'Malta',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO warehouses (code, name, line1, sort_order)
VALUES ('WH-A', 'Warehouse A', 'Joseph Bezzina & Co. Ltd — Main Warehouse', 1)
ON CONFLICT (code) DO NOTHING;

-- ── Product barcodes & locations ─────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS barcode TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_barcode ON product_variants (barcode) WHERE barcode IS NOT NULL;

CREATE TABLE IF NOT EXISTS product_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  zone TEXT,
  rack TEXT,
  shelf TEXT,
  bin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_locations_target_check
    CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_product_locations_product ON product_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_variant ON product_locations(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_warehouse ON product_locations(warehouse_id);

-- ── Inventory levels ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  incoming_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_levels_target_check
    CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL),
  CONSTRAINT inventory_levels_stock_non_negative
    CHECK (current_stock >= 0 AND reserved_stock >= 0 AND incoming_stock >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_levels_product_wh
  ON inventory_levels(product_id, warehouse_id)
  WHERE variant_id IS NULL AND product_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_levels_variant_wh
  ON inventory_levels(variant_id, warehouse_id)
  WHERE variant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_levels_low_stock
  ON inventory_levels(warehouse_id)
  WHERE available_stock <= min_stock;

-- ── Inventory transactions (audit ledger) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_level_id UUID NOT NULL REFERENCES inventory_levels(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('reserve', 'release', 'deduct', 'receive', 'adjust')),
  quantity INTEGER NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_level ON inventory_transactions(inventory_level_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order ON inventory_transactions(order_id);

-- ── Extend orders for OMS workflow ───────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_source TEXT NOT NULL DEFAULT 'online';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS oms_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timeline JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_salesman_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_source_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_source_check
      CHECK (order_source IN ('online', 'walk_in'));
  END IF;
END $$;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;

-- Backfill OMS status for existing orders
UPDATE orders SET oms_status = CASE
  WHEN fulfillment_method = 'store_pickup' AND pickup_status = 'collected' THEN 'completed'
  WHEN fulfillment_method = 'store_pickup' AND pickup_status = 'ready_for_pickup' THEN 'ready_for_collection'
  WHEN fulfillment_method = 'store_pickup' THEN 'warehouse_accepted'
  WHEN status = 'delivered' THEN 'completed'
  WHEN status = 'shipped' THEN 'out_for_delivery'
  ELSE 'waiting_for_approval'
END
WHERE oms_status IS NULL;

UPDATE orders SET order_source = 'online' WHERE order_source IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_oms_status ON orders(oms_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_salesman ON orders(assigned_salesman_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_driver ON orders(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ── Order status history ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC);

-- ── OMS report snapshots (aggregated metrics) ────────────────────────────────

CREATE TABLE IF NOT EXISTS oms_report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL
    CHECK (report_type IN ('sales', 'inventory', 'warehouse', 'customers', 'salesman', 'delivery', 'audit')),
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_type, period, period_start)
);

-- ── RLS: warehouses ──────────────────────────────────────────────────────────

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS warehouses_portal_read ON warehouses;
CREATE POLICY warehouses_portal_read ON warehouses
  FOR SELECT USING (public.is_oms_portal_user() OR is_active = true);

DROP POLICY IF EXISTS warehouses_staff_manage ON warehouses;
CREATE POLICY warehouses_staff_manage ON warehouses
  FOR ALL USING (public.is_staff() OR public.current_user_role() = 'warehouse_manager')
  WITH CHECK (public.is_staff() OR public.current_user_role() = 'warehouse_manager');

-- ── RLS: product_locations ───────────────────────────────────────────────────

ALTER TABLE product_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_locations_portal_read ON product_locations;
CREATE POLICY product_locations_portal_read ON product_locations
  FOR SELECT USING (public.is_oms_portal_user());

DROP POLICY IF EXISTS product_locations_inventory_manage ON product_locations;
CREATE POLICY product_locations_inventory_manage ON product_locations
  FOR ALL USING (
    public.is_staff()
    OR public.current_user_role() IN ('warehouse_manager', 'warehouse_staff')
  )
  WITH CHECK (
    public.is_staff()
    OR public.current_user_role() IN ('warehouse_manager', 'warehouse_staff')
  );

-- ── RLS: inventory_levels ────────────────────────────────────────────────────

ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_levels_portal_read ON inventory_levels;
CREATE POLICY inventory_levels_portal_read ON inventory_levels
  FOR SELECT USING (public.is_oms_portal_user());

DROP POLICY IF EXISTS inventory_levels_manage ON inventory_levels;
CREATE POLICY inventory_levels_manage ON inventory_levels
  FOR ALL USING (
    public.is_staff()
    OR public.current_user_role() IN ('warehouse_manager', 'warehouse_staff')
  )
  WITH CHECK (
    public.is_staff()
    OR public.current_user_role() IN ('warehouse_manager', 'warehouse_staff')
  );

-- ── RLS: inventory_transactions ──────────────────────────────────────────────

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_transactions_portal_read ON inventory_transactions;
CREATE POLICY inventory_transactions_portal_read ON inventory_transactions
  FOR SELECT USING (public.is_oms_portal_user());

DROP POLICY IF EXISTS inventory_transactions_insert ON inventory_transactions;
CREATE POLICY inventory_transactions_insert ON inventory_transactions
  FOR INSERT WITH CHECK (public.is_oms_portal_user());

-- ── RLS: order_status_history ────────────────────────────────────────────────

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_status_history_customer_read ON order_status_history;
CREATE POLICY order_status_history_customer_read ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_status_history_portal_read ON order_status_history;
CREATE POLICY order_status_history_portal_read ON order_status_history
  FOR SELECT USING (public.is_oms_portal_user());

DROP POLICY IF EXISTS order_status_history_portal_insert ON order_status_history;
CREATE POLICY order_status_history_portal_insert ON order_status_history
  FOR INSERT WITH CHECK (public.is_oms_portal_user());

-- ── Extend orders RLS for OMS roles ──────────────────────────────────────────

DROP POLICY IF EXISTS orders_select_staff ON orders;
CREATE POLICY orders_select_staff ON orders
  FOR SELECT USING (public.is_oms_portal_user());

DROP POLICY IF EXISTS orders_all_staff ON orders;
CREATE POLICY orders_update_oms ON orders
  FOR UPDATE USING (public.is_oms_portal_user())
  WITH CHECK (public.is_oms_portal_user());

DROP POLICY IF EXISTS orders_insert_walk_in ON orders;
CREATE POLICY orders_insert_walk_in ON orders
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR public.is_sales_role()
    OR public.is_staff()
  );

-- ── Realtime publications ────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_levels;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
