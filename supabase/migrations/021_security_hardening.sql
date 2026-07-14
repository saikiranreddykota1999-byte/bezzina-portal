-- Enterprise security hardening (OWASP-aligned)

-- ── 1. Profile privileged column protection ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profile_role_immutable';
    END IF;
    IF NEW.is_disabled IS DISTINCT FROM OLD.is_disabled THEN
      RAISE EXCEPTION 'profile_status_immutable';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'profile_email_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileged_columns ON profiles;
CREATE TRIGGER profiles_protect_privileged_columns
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- ── 2. RLS on previously unprotected tables ──────────────────────────────────

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brands_public_read ON brands;
CREATE POLICY brands_public_read ON brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS brands_staff_all ON brands;
CREATE POLICY brands_staff_all ON brands
  FOR ALL USING (public.is_staff())
  WITH CHECK (public.is_staff());

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS addresses_own ON addresses;
CREATE POLICY addresses_own ON addresses
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS addresses_staff ON addresses;
CREATE POLICY addresses_staff ON addresses
  FOR ALL USING (public.is_staff())
  WITH CHECK (public.is_staff());

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_tickets_own ON support_tickets;
CREATE POLICY support_tickets_own ON support_tickets
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS support_tickets_staff ON support_tickets;
CREATE POLICY support_tickets_staff ON support_tickets
  FOR ALL USING (public.is_staff())
  WITH CHECK (public.is_staff());

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS suggestions_insert ON suggestions;
CREATE POLICY suggestions_insert ON suggestions
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS suggestions_select ON suggestions;
CREATE POLICY suggestions_select ON suggestions
  FOR SELECT USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS suggestions_staff ON suggestions;
CREATE POLICY suggestions_staff ON suggestions
  FOR ALL USING (public.is_staff())
  WITH CHECK (public.is_staff());

ALTER TABLE oms_report_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oms_report_snapshots_management ON oms_report_snapshots;
CREATE POLICY oms_report_snapshots_management ON oms_report_snapshots
  FOR ALL USING (
    public.is_super_admin()
    OR public.current_user_role() IN ('admin', 'sales_manager', 'warehouse_manager')
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.current_user_role() IN ('admin', 'sales_manager', 'warehouse_manager')
  );

-- ── 3. Quote request items — prevent guest tampering ─────────────────────────

DROP POLICY IF EXISTS quote_items_via_quote ON quote_request_items;

DROP POLICY IF EXISTS quote_items_select ON quote_request_items;
CREATE POLICY quote_items_select ON quote_request_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quote_requests q
      WHERE q.id = quote_request_id
        AND (q.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS quote_items_insert ON quote_request_items;
CREATE POLICY quote_items_insert ON quote_request_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quote_requests q
      WHERE q.id = quote_request_id
        AND (q.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS quote_items_update ON quote_request_items;
CREATE POLICY quote_items_update ON quote_request_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quote_requests q
      WHERE q.id = quote_request_id
        AND (q.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS quote_items_delete ON quote_request_items;
CREATE POLICY quote_items_delete ON quote_request_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quote_requests q
      WHERE q.id = quote_request_id
        AND (q.user_id = auth.uid() OR public.is_staff())
    )
  );

-- ── 4. Login attempts — RPC-only inserts ─────────────────────────────────────

DROP POLICY IF EXISTS login_attempts_insert ON login_attempts;

CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email TEXT,
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, success)
  VALUES (lower(trim(p_email)), p_success);
END;
$$;

REVOKE INSERT ON login_attempts FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(TEXT, BOOLEAN) TO anon, authenticated;

-- ── 5. Rate limiting for public actions ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON rate_limit_events (action, identifier, created_at DESC);

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_identifier TEXT,
  p_max_attempts INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM rate_limit_events
  WHERE action = p_action
    AND identifier = lower(trim(p_identifier))
    AND created_at >= now() - (p_window_minutes || ' minutes')::INTERVAL;

  IF v_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO rate_limit_events (action, identifier)
  VALUES (p_action, lower(trim(p_identifier)));

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- ── 6. Warehouses — portal roles only ────────────────────────────────────────

DROP POLICY IF EXISTS warehouses_portal_read ON warehouses;
CREATE POLICY warehouses_portal_read ON warehouses
  FOR SELECT USING (public.is_oms_portal_user());

-- ── 7. Order notification logs — staff insert only ───────────────────────────

DROP POLICY IF EXISTS order_notifications_insert_authenticated ON order_notification_logs;
DROP POLICY IF EXISTS order_notifications_insert_staff ON order_notification_logs;
CREATE POLICY order_notifications_insert_staff ON order_notification_logs
  FOR INSERT WITH CHECK (public.is_staff() OR public.is_oms_portal_user());

-- ── 8. Storage bucket hardening ──────────────────────────────────────────────

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'career-documents';

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'product-images';

DROP POLICY IF EXISTS career_docs_public_upload ON storage.objects;
DROP POLICY IF EXISTS career_docs_service_upload ON storage.objects;
CREATE POLICY career_docs_service_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'career-documents'
    AND auth.role() = 'service_role'
  );
