-- RLS policies for customer orders + order items
-- Fixes: "new row violates row-level security policy for table orders"
-- Run in Supabase SQL Editor after 001/003/005 migrations.

-- Staff helper (idempotent — also defined in 003_store_pickup.sql)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ── orders ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS orders_insert_own ON orders;
CREATE POLICY orders_insert_own ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS orders_select_staff ON orders;
CREATE POLICY orders_select_staff ON orders
  FOR SELECT
  USING (public.is_staff());

DROP POLICY IF EXISTS orders_all_staff ON orders;
CREATE POLICY orders_all_staff ON orders
  FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ── order_items ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS order_items_select_own ON order_items;
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_items_insert_own ON order_items;
CREATE POLICY order_items_insert_own ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_items_all_staff ON order_items;
CREATE POLICY order_items_all_staff ON order_items
  FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
