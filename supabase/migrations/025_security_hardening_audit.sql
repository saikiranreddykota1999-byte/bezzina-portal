-- Security hardening (post-audit remediations)
-- C4/H1: profile INSERT role lock + force_password_change protection
-- H2: tighten OMS order UPDATE RLS to staff managers only
-- Catalog CREATE: see 000_catalog_foundation.sql

-- ── C4. Profile INSERT may only create customer self-profiles ───────────────

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND role = 'customer'
  );

CREATE OR REPLACE FUNCTION public.protect_profile_insert_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM 'customer' THEN
    RAISE EXCEPTION 'profile_role_must_be_customer';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_insert_role ON profiles;
CREATE TRIGGER profiles_protect_insert_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_insert_role();

-- ── H1/C4. Privileged UPDATE protection (+ force_password_change) ───────────

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- App admin mutations use the service role after requirePermission checks.
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

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
    IF NEW.force_password_change IS DISTINCT FROM OLD.force_password_change THEN
      RAISE EXCEPTION 'profile_force_password_change_immutable';
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

-- ── H2. OMS order updates via JWT limited to staff managers ──────────────────
-- Warehouse/sales/delivery staff mutations go through Server Actions (service role).

DROP POLICY IF EXISTS orders_update_oms ON orders;
CREATE POLICY orders_update_oms ON orders
  FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
