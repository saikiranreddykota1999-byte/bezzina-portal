-- Store Pickup (Click & Collect) schema
-- Run after 001_portal_schema.sql

-- ── Pickup locations (branches) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Malta',
  phone TEXT,
  email TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pickup_opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES pickup_locations(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at TIME NOT NULL DEFAULT '08:00',
  closes_at TIME NOT NULL DEFAULT '17:00',
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (location_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS pickup_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES pickup_locations(id) ON DELETE CASCADE,
  closed_date DATE NOT NULL,
  reason TEXT,
  UNIQUE (location_id, closed_date)
);

CREATE TABLE IF NOT EXISTS pickup_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES pickup_locations(id) ON DELETE CASCADE,
  slot_time TIME NOT NULL,
  label TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 5 CHECK (max_capacity > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (location_id, slot_time)
);

CREATE TABLE IF NOT EXISTS pickup_slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES pickup_locations(id),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_slot_bookings_lookup
  ON pickup_slot_bookings (location_id, slot_date, slot_time);

CREATE TABLE IF NOT EXISTS order_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email',
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed')),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Extend orders for fulfillment & pickup ──────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location_id UUID REFERENCES pickup_locations(id);
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

-- ── Seed default Marsa branch ───────────────────────────────────────────────

INSERT INTO pickup_locations (
  name, slug, line1, city, postal_code, country, phone, email, instructions, sort_order
) VALUES (
  'Marsa Main Branch',
  'marsa-main',
  '5/6 Triq Aldo Moro',
  'Il-Marsa',
  'MRS 9065',
  'Malta',
  '+356 2122 6647',
  'jason@jbezzina.com',
  'Enter via the main trade counter. Present your pickup code and order confirmation email. Parking is available at the rear of the premises.',
  0
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO pickup_opening_hours (location_id, day_of_week, opens_at, closes_at, is_closed)
SELECT pl.id, dow.day_of_week, '08:00'::TIME, '17:00'::TIME, dow.is_closed
FROM pickup_locations pl
CROSS JOIN (
  VALUES
    (1, false), (2, false), (3, false), (4, false), (5, false),
    (6, true), (0, true)
) AS dow(day_of_week, is_closed)
WHERE pl.slug = 'marsa-main'
ON CONFLICT (location_id, day_of_week) DO NOTHING;

INSERT INTO pickup_time_slots (location_id, slot_time, label, max_capacity)
SELECT pl.id, slot.slot_time, slot.label, slot.max_capacity
FROM pickup_locations pl
CROSS JOIN (
  VALUES
    ('09:00'::TIME, '09:00 – 10:00', 5),
    ('10:00'::TIME, '10:00 – 11:00', 5),
    ('11:00'::TIME, '11:00 – 12:00', 5),
    ('12:00'::TIME, '12:00 – 13:00', 3),
    ('14:00'::TIME, '14:00 – 15:00', 5),
    ('15:00'::TIME, '15:00 – 16:00', 5),
    ('16:00'::TIME, '16:00 – 17:00', 5)
) AS slot(slot_time, label, max_capacity)
WHERE pl.slug = 'marsa-main'
ON CONFLICT (location_id, slot_time) DO NOTHING;

-- ── RLS helper (idempotent) ─────────────────────────────────────────────────

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

ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_unavailable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pickup_locations_select_public ON pickup_locations;
CREATE POLICY pickup_locations_select_public ON pickup_locations
  FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS pickup_locations_all_staff ON pickup_locations;
CREATE POLICY pickup_locations_all_staff ON pickup_locations
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS pickup_hours_select_public ON pickup_opening_hours;
CREATE POLICY pickup_hours_select_public ON pickup_opening_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pickup_locations pl
      WHERE pl.id = location_id AND (pl.is_active = true OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS pickup_hours_all_staff ON pickup_opening_hours;
CREATE POLICY pickup_hours_all_staff ON pickup_opening_hours
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS pickup_unavailable_select_public ON pickup_unavailable_dates;
CREATE POLICY pickup_unavailable_select_public ON pickup_unavailable_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pickup_locations pl
      WHERE pl.id = location_id AND (pl.is_active = true OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS pickup_unavailable_all_staff ON pickup_unavailable_dates;
CREATE POLICY pickup_unavailable_all_staff ON pickup_unavailable_dates
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS pickup_slots_select_public ON pickup_time_slots;
CREATE POLICY pickup_slots_select_public ON pickup_time_slots
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM pickup_locations pl
      WHERE pl.id = location_id AND pl.is_active = true
    )
    OR public.is_staff()
  );

DROP POLICY IF EXISTS pickup_slots_all_staff ON pickup_time_slots;
CREATE POLICY pickup_slots_all_staff ON pickup_time_slots
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS pickup_bookings_select_own ON pickup_slot_bookings;
CREATE POLICY pickup_bookings_select_own ON pickup_slot_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pickup_bookings_select_staff ON pickup_slot_bookings;
CREATE POLICY pickup_bookings_select_staff ON pickup_slot_bookings
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS pickup_bookings_insert_own ON pickup_slot_bookings;
CREATE POLICY pickup_bookings_insert_own ON pickup_slot_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pickup_bookings_all_staff ON pickup_slot_bookings;
CREATE POLICY pickup_bookings_all_staff ON pickup_slot_bookings
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS order_notifications_select_own ON order_notification_logs;
CREATE POLICY order_notifications_select_own ON order_notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_notifications_all_staff ON order_notification_logs;
CREATE POLICY order_notifications_all_staff ON order_notification_logs
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS order_notifications_insert_authenticated ON order_notification_logs;
CREATE POLICY order_notifications_insert_authenticated ON order_notification_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
