-- Fix staff RLS helpers and close policy gaps for admin portal.
-- Safe to run in Supabase SQL Editor if db push is unavailable.

-- Normalize legacy staff role
UPDATE profiles SET role = 'admin' WHERE role = 'staff';

-- Staff helper: admin + super_admin, respect disabled flag
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

-- Vacancies: ensure staff can manage all rows
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacancies_public_read ON vacancies;
CREATE POLICY vacancies_public_read ON vacancies
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS vacancies_staff_all ON vacancies;
CREATE POLICY vacancies_staff_all ON vacancies
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Job applications: staff can update status
DROP POLICY IF EXISTS job_applications_staff_update ON job_applications;
CREATE POLICY job_applications_staff_update ON job_applications
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS job_applications_staff_delete ON job_applications;
CREATE POLICY job_applications_staff_delete ON job_applications
  FOR DELETE USING (public.is_staff());

-- Site settings: prevent regular admins from sensitive keys
DROP POLICY IF EXISTS site_settings_staff_write ON site_settings;
DROP POLICY IF EXISTS site_settings_super_admin_sensitive ON site_settings;

CREATE POLICY site_settings_staff_read ON site_settings
  FOR SELECT USING (
    public.is_staff()
    AND (
      public.is_super_admin()
      OR key NOT IN ('backup', 'database', 'analytics')
    )
  );

CREATE POLICY site_settings_staff_write ON site_settings
  FOR INSERT WITH CHECK (
    public.is_staff()
    AND key NOT IN ('backup', 'database', 'analytics')
  );

CREATE POLICY site_settings_staff_update ON site_settings
  FOR UPDATE USING (
    public.is_staff()
    AND key NOT IN ('backup', 'database', 'analytics')
  ) WITH CHECK (
    public.is_staff()
    AND key NOT IN ('backup', 'database', 'analytics')
  );

CREATE POLICY site_settings_staff_delete ON site_settings
  FOR DELETE USING (
    public.is_staff()
    AND key NOT IN ('backup', 'database', 'analytics')
  );

CREATE POLICY site_settings_super_admin_all ON site_settings
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
