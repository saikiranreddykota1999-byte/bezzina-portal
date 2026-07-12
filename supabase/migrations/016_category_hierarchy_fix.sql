-- Fix category hierarchy and add subcategories for bolts/fasteners.
-- Run in Supabase SQL Editor after seed_catalogue_data.sql (or standalone).

-- Ensure division roots exist
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Marine Supplies', 'marine-supplies', 'Marine Supplies catalogue', 1, 'marine', NULL)
ON CONFLICT (slug) DO UPDATE SET division = EXCLUDED.division, parent_id = NULL;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Industrial Equipment', 'industrial-equipment', 'Industrial Equipment catalogue', 2, 'industrial', NULL)
ON CONFLICT (slug) DO UPDATE SET division = EXCLUDED.division, parent_id = NULL;

-- Re-parent orphan marine categories (missing parent_id)
UPDATE categories AS c
SET parent_id = (SELECT id FROM categories WHERE slug = 'marine-supplies')
WHERE c.parent_id IS NULL
  AND c.division = 'marine'
  AND c.slug <> 'marine-supplies';

-- Re-parent orphan industrial categories (missing parent_id)
UPDATE categories AS c
SET parent_id = (SELECT id FROM categories WHERE slug = 'industrial-equipment')
WHERE c.parent_id IS NULL
  AND c.division = 'industrial'
  AND c.slug <> 'industrial-equipment';

-- Ensure Bolts & Fasteners parent exists under Industrial Equipment
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES (
  'Bolts & Fasteners',
  'industrial-bolts-fasteners',
  'Industrial bolts, nuts, washers, studs, rivets, and anchors',
  5,
  'industrial',
  (SELECT id FROM categories WHERE slug = 'industrial-equipment')
)
ON CONFLICT (slug) DO UPDATE
SET parent_id = EXCLUDED.parent_id,
    division = EXCLUDED.division,
    description = EXCLUDED.description;

-- If a standalone "Bolts" parent exists, merge its children expectation under bolts-fasteners
DO $$
DECLARE
  bolts_fasteners_id UUID;
  standalone_bolts_id UUID;
BEGIN
  SELECT id INTO bolts_fasteners_id FROM categories WHERE slug = 'industrial-bolts-fasteners' LIMIT 1;
  SELECT id INTO standalone_bolts_id
  FROM categories
  WHERE parent_id IS NULL
    AND (slug = 'bolts' OR name ILIKE 'bolts')
    AND slug <> 'industrial-bolts-fasteners'
  LIMIT 1;

  IF standalone_bolts_id IS NOT NULL AND bolts_fasteners_id IS NOT NULL THEN
    UPDATE products SET category_id = bolts_fasteners_id WHERE category_id = standalone_bolts_id;
    DELETE FROM categories WHERE id = standalone_bolts_id;
  END IF;
END $$;

-- Add product subcategories under Bolts & Fasteners
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
SELECT v.name, v.slug, v.description, v.sort_order, 'industrial', p.id
FROM categories p
CROSS JOIN (
  VALUES
    ('Hex Bolts', 'ind-bf-hex-bolts', 'Hex head bolts', 1),
    ('Carriage Bolts', 'ind-bf-carriage-bolts', 'Carriage bolts', 2),
    ('Machine Bolts', 'ind-bf-machine-bolts', 'Machine bolts', 3),
    ('Nuts', 'ind-bf-nuts', 'Hex, lock, and cap nuts', 4),
    ('Washers', 'ind-bf-washers', 'Flat, lock, and spring washers', 5),
    ('Studs', 'ind-bf-studs', 'Threaded studs', 6),
    ('Rivets', 'ind-bf-rivets', 'Blind and solid rivets', 7),
    ('Anchor Bolts', 'ind-bf-anchor-bolts', 'Concrete and wall anchors', 8)
) AS v(name, slug, description, sort_order)
WHERE p.slug = 'industrial-bolts-fasteners'
ON CONFLICT (slug) DO UPDATE
SET parent_id = EXCLUDED.parent_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    division = EXCLUDED.division;

-- Add subcategories under marine Nuts & Bolts if present
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
SELECT v.name, v.slug, v.description, v.sort_order, 'marine', p.id
FROM categories p
CROSS JOIN (
  VALUES
    ('Stainless Bolts', 'mar-nb-stainless-bolts', 'Marine-grade stainless bolts', 1),
    ('Stainless Nuts', 'mar-nb-stainless-nuts', 'Marine-grade stainless nuts', 2),
    ('Stainless Washers', 'mar-nb-stainless-washers', 'Marine-grade stainless washers', 3),
    ('Fastener Kits', 'mar-nb-fastener-kits', 'Assorted marine fastener kits', 4)
) AS v(name, slug, description, sort_order)
WHERE p.slug = 'marine-nuts-bolts'
ON CONFLICT (slug) DO UPDATE
SET parent_id = EXCLUDED.parent_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    division = EXCLUDED.division;
