-- Vacancies table for careers page (replaces job_postings)

CREATE TABLE IF NOT EXISTS vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Malta',
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacancies_active_sort ON vacancies(is_active, sort_order);

-- Migrate existing job_postings data if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'job_postings'
  ) THEN
    INSERT INTO vacancies (
      id, title, department, location, short_description, description,
      requirements, is_active, sort_order, created_at, updated_at
    )
    SELECT
      id,
      title,
      department,
      location,
      LEFT(description, 240),
      description,
      requirements,
      is_active,
      sort_order,
      created_at,
      updated_at
    FROM job_postings
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Link applications to vacancies
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS vacancy_id UUID REFERENCES vacancies(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'job_applications'
      AND column_name = 'job_posting_id'
  ) THEN
    UPDATE job_applications ja
    SET vacancy_id = ja.job_posting_id
    WHERE vacancy_id IS NULL
      AND job_posting_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM vacancies v WHERE v.id = ja.job_posting_id);
  END IF;
END $$;

-- RLS
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacancies_public_read ON vacancies;
CREATE POLICY vacancies_public_read ON vacancies
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS vacancies_staff_all ON vacancies;
CREATE POLICY vacancies_staff_all ON vacancies
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
