-- Secure login rate limiting via RPC (no public SELECT on login_attempts)

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS login_attempts_insert ON login_attempts;
CREATE POLICY login_attempts_insert ON login_attempts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS login_attempts_staff_read ON login_attempts;
CREATE POLICY login_attempts_staff_read ON login_attempts
  FOR SELECT USING (public.is_staff());

CREATE OR REPLACE FUNCTION public.count_failed_login_attempts(
  p_email TEXT,
  p_since TIMESTAMPTZ
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE email = lower(trim(p_email))
    AND success = false
    AND attempted_at >= p_since;
$$;

GRANT EXECUTE ON FUNCTION public.count_failed_login_attempts(TEXT, TIMESTAMPTZ) TO anon, authenticated;
