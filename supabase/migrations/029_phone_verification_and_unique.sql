-- Phone ownership verification support: normalize_phone() + unique normalized phone.
-- Fails loudly if duplicate normalized phones exist (do not merge/delete here).

CREATE OR REPLACE FUNCTION public.normalize_phone(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits text;
  trimmed text;
BEGIN
  IF input IS NULL THEN
    RETURN NULL;
  END IF;

  trimmed := btrim(input);
  digits := regexp_replace(trimmed, '\D', '', 'g');

  IF length(digits) < 8 OR length(digits) > 15 THEN
    RETURN NULL;
  END IF;

  IF left(trimmed, 1) = '+' THEN
    RETURN '+' || digits;
  END IF;

  IF left(digits, 3) = '356' THEN
    RETURN '+' || digits;
  END IF;

  IF length(digits) = 8 THEN
    RETURN '+356' || digits;
  END IF;

  RETURN '+' || digits;
END;
$$;

-- Normalize existing stored phones (format only; does not merge accounts).
UPDATE profiles
SET phone = public.normalize_phone(phone)
WHERE phone IS NOT NULL
  AND public.normalize_phone(phone) IS NOT NULL
  AND phone IS DISTINCT FROM public.normalize_phone(phone);

DO $$
DECLARE
  dup_count integer;
  dup_sample text;
BEGIN
  SELECT COUNT(*)::integer INTO dup_count
  FROM (
    SELECT public.normalize_phone(phone) AS nphone
    FROM profiles
    WHERE phone IS NOT NULL
      AND public.normalize_phone(phone) IS NOT NULL
    GROUP BY public.normalize_phone(phone)
    HAVING COUNT(*) > 1
  ) d;

  IF dup_count > 0 THEN
    SELECT string_agg(nphone || ' (x' || cnt || ')', ', ')
    INTO dup_sample
    FROM (
      SELECT public.normalize_phone(phone) AS nphone, COUNT(*)::text AS cnt
      FROM profiles
      WHERE phone IS NOT NULL
        AND public.normalize_phone(phone) IS NOT NULL
      GROUP BY public.normalize_phone(phone)
      HAVING COUNT(*) > 1
      LIMIT 10
    ) s;

    RAISE EXCEPTION
      'Cannot create profiles_phone_unique_idx: % duplicate normalized phone group(s). Resolve manually before re-running. Sample: %',
      dup_count,
      COALESCE(dup_sample, '(none)');
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx
  ON profiles (public.normalize_phone(phone))
  WHERE phone IS NOT NULL;
