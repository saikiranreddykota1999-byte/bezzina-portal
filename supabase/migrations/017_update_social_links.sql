-- Align CMS social defaults with canonical company links
UPDATE site_settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{facebook}',
  '"https://www.facebook.com/JosephBezzina.Co.Ltd/"'::jsonb,
  true
)
WHERE key = 'social'
  AND (
    value->>'facebook' IS NULL
    OR value->>'facebook' = ''
    OR value->>'facebook' ILIKE '%facebook.com/JosephBezzina%'
  );
