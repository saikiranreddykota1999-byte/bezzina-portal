-- Bezzina Portal: Schema prep + Marine & Industrial catalogue seed
-- Run this entire file in Supabase SQL Editor

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS division TEXT
  CHECK (division IS NULL OR division IN ('marine', 'industrial'));

DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Marine Supplies
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Marine Supplies', 'marine-supplies', 'Marine Supplies catalogue', 1, 'marine', NULL)
ON CONFLICT (slug) DO UPDATE SET division = EXCLUDED.division;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Anchors', 'marine-anchors', 'Anchors', 1, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-01', 'Stockless', 'marine-anchors-stockless-1', 'Stockless — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, true, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-02', 'Hall', 'marine-anchors-hall-2', 'Hall — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, false, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-03', 'AC-14', 'marine-anchors-ac-14-3', 'AC-14 — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, false, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-04', 'Danforth', 'marine-anchors-danforth-4', 'Danforth — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, false, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-05', 'Plough', 'marine-anchors-plough-5', 'Plough — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, false, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-001-06', 'Bruce anchors', 'marine-anchors-bruce-anchors-6', 'Bruce anchors — professional grade anchors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anchors'), 'each', true, 0, false, true, ARRAY['marine','a','anchors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Anodes', 'marine-anodes', 'Anodes', 2, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-002-01', 'Zinc sacrificial anodes', 'marine-anodes-zinc-sacrificial-anodes-1', 'Zinc sacrificial anodes — professional grade anodes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anodes'), 'each', true, 0, true, true, ARRAY['marine','a','anodes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-002-02', 'Aluminum sacrificial anodes', 'marine-anodes-aluminum-sacrificial-anodes-2', 'Aluminum sacrificial anodes — professional grade anodes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anodes'), 'each', true, 0, false, true, ARRAY['marine','a','anodes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-002-03', 'Magnesium sacrificial anodes', 'marine-anodes-magnesium-sacrificial-anodes-3', 'Magnesium sacrificial anodes — professional grade anodes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anodes'), 'each', true, 0, false, true, ARRAY['marine','a','anodes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Air Compressors', 'marine-air-compressors', 'Air Compressors', 3, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-003-01', 'Starting air compressors', 'marine-air-compressors-starting-air-compressors-1', 'Starting air compressors — professional grade air compressors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-air-compressors'), 'each', true, 0, true, true, ARRAY['marine','a','air-compressors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-003-02', 'Service compressors', 'marine-air-compressors-service-compressors-2', 'Service compressors — professional grade air compressors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-air-compressors'), 'each', true, 0, false, true, ARRAY['marine','a','air-compressors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Anti-fouling Paint', 'marine-anti-fouling-paint', 'Anti-fouling Paint', 4, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-A-004-01', 'Hull anti-growth coatings', 'marine-anti-fouling-paint-hull-anti-growth-coatings-1', 'Hull anti-growth coatings — professional grade anti-fouling paint for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-anti-fouling-paint'), 'each', true, 0, true, true, ARRAY['marine','a','anti-fouling-paint'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Batteries', 'marine-batteries', 'Batteries', 5, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-005-01', 'Marine starting batteries', 'marine-batteries-marine-starting-batteries-1', 'Marine starting batteries — professional grade batteries for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-batteries'), 'each', true, 0, true, true, ARRAY['marine','b','batteries'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-005-02', 'Deep-cycle batteries', 'marine-batteries-deep-cycle-batteries-2', 'Deep-cycle batteries — professional grade batteries for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-batteries'), 'each', true, 0, false, true, ARRAY['marine','b','batteries'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Bilge Pumps', 'marine-bilge-pumps', 'Bilge Pumps', 6, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-006-01', 'Engine room water removal pumps', 'marine-bilge-pumps-engine-room-water-removal-pumps-1', 'Engine room water removal pumps — professional grade bilge pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-bilge-pumps'), 'each', true, 0, true, true, ARRAY['marine','b','bilge-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-006-02', 'Compartment water removal pumps', 'marine-bilge-pumps-compartment-water-removal-pumps-2', 'Compartment water removal pumps — professional grade bilge pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-bilge-pumps'), 'each', true, 0, false, true, ARRAY['marine','b','bilge-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Bearings', 'marine-bearings', 'Bearings', 7, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-007-01', 'Shaft bearings', 'marine-bearings-shaft-bearings-1', 'Shaft bearings — professional grade bearings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-bearings'), 'each', true, 0, true, true, ARRAY['marine','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-007-02', 'Engine bearings', 'marine-bearings-engine-bearings-2', 'Engine bearings — professional grade bearings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-bearings'), 'each', true, 0, false, true, ARRAY['marine','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-007-03', 'Machinery bearings', 'marine-bearings-machinery-bearings-3', 'Machinery bearings — professional grade bearings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-bearings'), 'each', true, 0, false, true, ARRAY['marine','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Binoculars', 'marine-binoculars', 'Binoculars', 8, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-008-01', 'Marine-grade navigation binoculars', 'marine-binoculars-marine-grade-navigation-binoculars-1', 'Marine-grade navigation binoculars — professional grade binoculars for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-binoculars'), 'each', true, 0, true, true, ARRAY['marine','b','binoculars'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Boat Hooks', 'marine-boat-hooks', 'Boat Hooks', 9, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-009-01', 'Docking boat hooks', 'marine-boat-hooks-docking-boat-hooks-1', 'Docking boat hooks — professional grade boat hooks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-boat-hooks'), 'each', true, 0, true, true, ARRAY['marine','b','boat-hooks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-B-009-02', 'Line retrieval boat hooks', 'marine-boat-hooks-line-retrieval-boat-hooks-2', 'Line retrieval boat hooks — professional grade boat hooks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-boat-hooks'), 'each', true, 0, false, true, ARRAY['marine','b','boat-hooks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Chains', 'marine-chains', 'Chains', 10, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-010-01', 'Anchor chains', 'marine-chains-anchor-chains-1', 'Anchor chains — professional grade chains for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-chains'), 'each', true, 0, true, true, ARRAY['marine','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-010-02', 'Stud-link chains', 'marine-chains-stud-link-chains-2', 'Stud-link chains — professional grade chains for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-chains'), 'each', true, 0, false, true, ARRAY['marine','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-010-03', 'Mooring chains', 'marine-chains-mooring-chains-3', 'Mooring chains — professional grade chains for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-chains'), 'each', true, 0, false, true, ARRAY['marine','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Cables', 'marine-cables', 'Cables', 11, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-011-01', 'Electrical cables', 'marine-cables-electrical-cables-1', 'Electrical cables — professional grade cables for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cables'), 'each', true, 0, true, true, ARRAY['marine','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-011-02', 'Engine control cables', 'marine-cables-engine-control-cables-2', 'Engine control cables — professional grade cables for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cables'), 'each', true, 0, false, true, ARRAY['marine','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-011-03', 'Communication cables', 'marine-cables-communication-cables-3', 'Communication cables — professional grade cables for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cables'), 'each', true, 0, false, true, ARRAY['marine','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Compasses', 'marine-compasses', 'Compasses', 12, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-012-01', 'Magnetic navigation compasses', 'marine-compasses-magnetic-navigation-compasses-1', 'Magnetic navigation compasses — professional grade compasses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-compasses'), 'each', true, 0, true, true, ARRAY['marine','c','compasses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-012-02', 'Gyro navigation compasses', 'marine-compasses-gyro-navigation-compasses-2', 'Gyro navigation compasses — professional grade compasses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-compasses'), 'each', true, 0, false, true, ARRAY['marine','c','compasses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Cleaning Chemicals', 'marine-cleaning-chemicals', 'Cleaning Chemicals', 13, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-013-01', 'Deck cleaners', 'marine-cleaning-chemicals-deck-cleaners-1', 'Deck cleaners — professional grade cleaning chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cleaning-chemicals'), 'each', true, 0, true, true, ARRAY['marine','c','cleaning-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-013-02', 'Tank cleaners', 'marine-cleaning-chemicals-tank-cleaners-2', 'Tank cleaners — professional grade cleaning chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cleaning-chemicals'), 'each', true, 0, false, true, ARRAY['marine','c','cleaning-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-013-03', 'Engine degreasers', 'marine-cleaning-chemicals-engine-degreasers-3', 'Engine degreasers — professional grade cleaning chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-cleaning-chemicals'), 'each', true, 0, false, true, ARRAY['marine','c','cleaning-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Couplings', 'marine-couplings', 'Couplings', 14, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-014-01', 'Flexible shaft couplings', 'marine-couplings-flexible-shaft-couplings-1', 'Flexible shaft couplings — professional grade couplings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-couplings'), 'each', true, 0, true, true, ARRAY['marine','c','couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-C-014-02', 'Pump couplings', 'marine-couplings-pump-couplings-2', 'Pump couplings — professional grade couplings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-couplings'), 'each', true, 0, false, true, ARRAY['marine','c','couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Deck Equipment', 'marine-deck-equipment', 'Deck Equipment', 15, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-015-01', 'Winches', 'marine-deck-equipment-winches-1', 'Winches — professional grade deck equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-deck-equipment'), 'each', true, 0, true, true, ARRAY['marine','d','deck-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-015-02', 'Capstans', 'marine-deck-equipment-capstans-2', 'Capstans — professional grade deck equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-deck-equipment'), 'each', true, 0, false, true, ARRAY['marine','d','deck-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-015-03', 'Fairleads', 'marine-deck-equipment-fairleads-3', 'Fairleads — professional grade deck equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-deck-equipment'), 'each', true, 0, false, true, ARRAY['marine','d','deck-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-015-04', 'Bollards', 'marine-deck-equipment-bollards-4', 'Bollards — professional grade deck equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-deck-equipment'), 'each', true, 0, false, true, ARRAY['marine','d','deck-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Davits', 'marine-davits', 'Davits', 16, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-016-01', 'Lifeboat launching davits', 'marine-davits-lifeboat-launching-davits-1', 'Lifeboat launching davits — professional grade davits for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-davits'), 'each', true, 0, true, true, ARRAY['marine','d','davits'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-016-02', 'Rescue boat launching davits', 'marine-davits-rescue-boat-launching-davits-2', 'Rescue boat launching davits — professional grade davits for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-davits'), 'each', true, 0, false, true, ARRAY['marine','d','davits'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Diesel Filters', 'marine-diesel-filters', 'Diesel Filters', 17, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-017-01', 'Fuel filtration', 'marine-diesel-filters-fuel-filtration-1', 'Fuel filtration — professional grade diesel filters for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-diesel-filters'), 'each', true, 0, true, true, ARRAY['marine','d','diesel-filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-017-02', 'Oil filtration', 'marine-diesel-filters-oil-filtration-2', 'Oil filtration — professional grade diesel filters for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-diesel-filters'), 'each', true, 0, false, true, ARRAY['marine','d','diesel-filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Deck Paint', 'marine-deck-paint', 'Deck Paint', 18, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-D-018-01', 'Protective deck coatings', 'marine-deck-paint-protective-deck-coatings-1', 'Protective deck coatings — professional grade deck paint for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-deck-paint'), 'each', true, 0, true, true, ARRAY['marine','d','deck-paint'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Engine Spare Parts', 'marine-engine-spare-parts', 'Engine Spare Parts', 19, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-019-01', 'Pistons', 'marine-engine-spare-parts-pistons-1', 'Pistons — professional grade engine spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-engine-spare-parts'), 'each', true, 0, true, true, ARRAY['marine','e','engine-spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-019-02', 'Liners', 'marine-engine-spare-parts-liners-2', 'Liners — professional grade engine spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-engine-spare-parts'), 'each', true, 0, false, true, ARRAY['marine','e','engine-spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-019-03', 'Valves', 'marine-engine-spare-parts-valves-3', 'Valves — professional grade engine spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-engine-spare-parts'), 'each', true, 0, false, true, ARRAY['marine','e','engine-spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-019-04', 'Gaskets', 'marine-engine-spare-parts-gaskets-4', 'Gaskets — professional grade engine spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-engine-spare-parts'), 'each', true, 0, false, true, ARRAY['marine','e','engine-spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-019-05', 'Injectors', 'marine-engine-spare-parts-injectors-5', 'Injectors — professional grade engine spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-engine-spare-parts'), 'each', true, 0, false, true, ARRAY['marine','e','engine-spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Emergency Lights', 'marine-emergency-lights', 'Emergency Lights', 20, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-020-01', 'SOLAS-approved emergency lighting', 'marine-emergency-lights-solas-approved-emergency-lighting-1', 'SOLAS-approved emergency lighting — professional grade emergency lights for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-emergency-lights'), 'each', true, 0, true, true, ARRAY['marine','e','emergency-lights'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Epoxy Products', 'marine-epoxy-products', 'Epoxy Products', 21, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-021-01', 'Hull repair compounds', 'marine-epoxy-products-hull-repair-compounds-1', 'Hull repair compounds — professional grade epoxy products for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-epoxy-products'), 'each', true, 0, true, true, ARRAY['marine','e','epoxy-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-E-021-02', 'Structural repair compounds', 'marine-epoxy-products-structural-repair-compounds-2', 'Structural repair compounds — professional grade epoxy products for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-epoxy-products'), 'each', true, 0, false, true, ARRAY['marine','e','epoxy-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Fire Extinguishers', 'marine-fire-extinguishers', 'Fire Extinguishers', 22, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-022-01', 'CO₂ fire extinguishers', 'marine-fire-extinguishers-co-fire-extinguishers-1', 'CO₂ fire extinguishers — professional grade fire extinguishers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fire-extinguishers'), 'each', true, 0, true, true, ARRAY['marine','f','fire-extinguishers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-022-02', 'Foam fire extinguishers', 'marine-fire-extinguishers-foam-fire-extinguishers-2', 'Foam fire extinguishers — professional grade fire extinguishers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fire-extinguishers'), 'each', true, 0, false, true, ARRAY['marine','f','fire-extinguishers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-022-03', 'Dry Powder fire extinguishers', 'marine-fire-extinguishers-dry-powder-fire-extinguishers-3', 'Dry Powder fire extinguishers — professional grade fire extinguishers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fire-extinguishers'), 'each', true, 0, false, true, ARRAY['marine','f','fire-extinguishers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Fire Hoses', 'marine-fire-hoses', 'Fire Hoses', 23, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-023-01', 'Marine fire-fighting hose assemblies', 'marine-fire-hoses-marine-fire-fighting-hose-assemblies-1', 'Marine fire-fighting hose assemblies — professional grade fire hoses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fire-hoses'), 'each', true, 0, true, true, ARRAY['marine','f','fire-hoses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Fenders', 'marine-fenders', 'Fenders', 24, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-024-01', 'Pneumatic fenders', 'marine-fenders-pneumatic-fenders-1', 'Pneumatic fenders — professional grade fenders for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fenders'), 'each', true, 0, true, true, ARRAY['marine','f','fenders'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-024-02', 'Foam fenders', 'marine-fenders-foam-fenders-2', 'Foam fenders — professional grade fenders for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fenders'), 'each', true, 0, false, true, ARRAY['marine','f','fenders'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-024-03', 'Rubber docking fenders', 'marine-fenders-rubber-docking-fenders-3', 'Rubber docking fenders — professional grade fenders for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fenders'), 'each', true, 0, false, true, ARRAY['marine','f','fenders'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Fuel Pumps', 'marine-fuel-pumps', 'Fuel Pumps', 25, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-025-01', 'Marine diesel transfer pumps', 'marine-fuel-pumps-marine-diesel-transfer-pumps-1', 'Marine diesel transfer pumps — professional grade fuel pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fuel-pumps'), 'each', true, 0, true, true, ARRAY['marine','f','fuel-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-F-025-02', 'Marine diesel supply pumps', 'marine-fuel-pumps-marine-diesel-supply-pumps-2', 'Marine diesel supply pumps — professional grade fuel pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-fuel-pumps'), 'each', true, 0, false, true, ARRAY['marine','f','fuel-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Gaskets', 'marine-gaskets', 'Gaskets', 26, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-026-01', 'Engine gaskets', 'marine-gaskets-engine-gaskets-1', 'Engine gaskets — professional grade gaskets for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-gaskets'), 'each', true, 0, true, true, ARRAY['marine','g','gaskets'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-026-02', 'Flange gaskets', 'marine-gaskets-flange-gaskets-2', 'Flange gaskets — professional grade gaskets for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-gaskets'), 'each', true, 0, false, true, ARRAY['marine','g','gaskets'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-026-03', 'Pump sealing gaskets', 'marine-gaskets-pump-sealing-gaskets-3', 'Pump sealing gaskets — professional grade gaskets for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-gaskets'), 'each', true, 0, false, true, ARRAY['marine','g','gaskets'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('GPS Systems', 'marine-gps-systems', 'GPS Systems', 27, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-027-01', 'Marine satellite navigation GPS', 'marine-gps-systems-marine-satellite-navigation-gps-1', 'Marine satellite navigation GPS — professional grade gps systems for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-gps-systems'), 'each', true, 0, true, true, ARRAY['marine','g','gps-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Galley Equipment', 'marine-galley-equipment', 'Galley Equipment', 28, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-028-01', 'Commercial kitchen appliances', 'marine-galley-equipment-commercial-kitchen-appliances-1', 'Commercial kitchen appliances — professional grade galley equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-galley-equipment'), 'each', true, 0, true, true, ARRAY['marine','g','galley-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-G-028-02', 'Commercial kitchen utensils', 'marine-galley-equipment-commercial-kitchen-utensils-2', 'Commercial kitchen utensils — professional grade galley equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-galley-equipment'), 'each', true, 0, false, true, ARRAY['marine','g','galley-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hydraulic Pumps', 'marine-hydraulic-pumps', 'Hydraulic Pumps', 29, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-029-01', 'Steering hydraulics', 'marine-hydraulic-pumps-steering-hydraulics-1', 'Steering hydraulics — professional grade hydraulic pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hydraulic-pumps'), 'each', true, 0, true, true, ARRAY['marine','h','hydraulic-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-029-02', 'Deck machinery hydraulics', 'marine-hydraulic-pumps-deck-machinery-hydraulics-2', 'Deck machinery hydraulics — professional grade hydraulic pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hydraulic-pumps'), 'each', true, 0, false, true, ARRAY['marine','h','hydraulic-pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hoses', 'marine-hoses', 'Hoses', 30, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-030-01', 'Fuel hoses', 'marine-hoses-fuel-hoses-1', 'Fuel hoses — professional grade hoses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hoses'), 'each', true, 0, true, true, ARRAY['marine','h','hoses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-030-02', 'Hydraulic hoses', 'marine-hoses-hydraulic-hoses-2', 'Hydraulic hoses — professional grade hoses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hoses'), 'each', true, 0, false, true, ARRAY['marine','h','hoses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-030-03', 'Cooling hoses', 'marine-hoses-cooling-hoses-3', 'Cooling hoses — professional grade hoses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hoses'), 'each', true, 0, false, true, ARRAY['marine','h','hoses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-030-04', 'Air hoses', 'marine-hoses-air-hoses-4', 'Air hoses — professional grade hoses for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hoses'), 'each', true, 0, false, true, ARRAY['marine','h','hoses'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hatch Covers', 'marine-hatch-covers', 'Hatch Covers', 31, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-H-031-01', 'Cargo hold weather-tight covers', 'marine-hatch-covers-cargo-hold-weather-tight-covers-1', 'Cargo hold weather-tight covers — professional grade hatch covers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-hatch-covers'), 'each', true, 0, true, true, ARRAY['marine','h','hatch-covers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Impellers', 'marine-impellers', 'Impellers', 32, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-I-032-01', 'Cooling water pump impellers', 'marine-impellers-cooling-water-pump-impellers-1', 'Cooling water pump impellers — professional grade impellers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-impellers'), 'each', true, 0, true, true, ARRAY['marine','i','impellers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Insulation Materials', 'marine-insulation-materials', 'Insulation Materials', 33, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-I-033-01', 'Thermal insulation', 'marine-insulation-materials-thermal-insulation-1', 'Thermal insulation — professional grade insulation materials for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-insulation-materials'), 'each', true, 0, true, true, ARRAY['marine','i','insulation-materials'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-I-033-02', 'Acoustic insulation', 'marine-insulation-materials-acoustic-insulation-2', 'Acoustic insulation — professional grade insulation materials for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-insulation-materials'), 'each', true, 0, false, true, ARRAY['marine','i','insulation-materials'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Inflatable Boats', 'marine-inflatable-boats', 'Inflatable Boats', 34, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-I-034-01', 'Rescue boats', 'marine-inflatable-boats-rescue-boats-1', 'Rescue boats — professional grade inflatable boats for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-inflatable-boats'), 'each', true, 0, true, true, ARRAY['marine','i','inflatable-boats'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-I-034-02', 'Work boats', 'marine-inflatable-boats-work-boats-2', 'Work boats — professional grade inflatable boats for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-inflatable-boats'), 'each', true, 0, false, true, ARRAY['marine','i','inflatable-boats'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Jackets (Life Jackets)', 'marine-jackets-life-jackets', 'Jackets (Life Jackets)', 35, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-J-035-01', 'SOLAS-approved life jackets', 'marine-jackets-life-jackets-solas-approved-life-jackets-1', 'SOLAS-approved life jackets — professional grade jackets (life jackets) for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-jackets-life-jackets'), 'each', true, 0, true, true, ARRAY['marine','j','jackets-life-jackets'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Junction Boxes', 'marine-junction-boxes', 'Junction Boxes', 36, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-J-036-01', 'Marine electrical distribution boxes', 'marine-junction-boxes-marine-electrical-distribution-boxes-1', 'Marine electrical distribution boxes — professional grade junction boxes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-junction-boxes'), 'each', true, 0, true, true, ARRAY['marine','j','junction-boxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Keys & Key Switches', 'marine-keys-key-switches', 'Keys & Key Switches', 37, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-K-037-01', 'Engine control keys', 'marine-keys-key-switches-engine-control-keys-1', 'Engine control keys — professional grade keys & key switches for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-keys-key-switches'), 'each', true, 0, true, true, ARRAY['marine','k','keys-key-switches'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-K-037-02', 'Electrical control accessories', 'marine-keys-key-switches-electrical-control-accessories-2', 'Electrical control accessories — professional grade keys & key switches for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-keys-key-switches'), 'each', true, 0, false, true, ARRAY['marine','k','keys-key-switches'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Knives', 'marine-knives', 'Knives', 38, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-K-038-01', 'Rigging knives', 'marine-knives-rigging-knives-1', 'Rigging knives — professional grade knives for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-knives'), 'each', true, 0, true, true, ARRAY['marine','k','knives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-K-038-02', 'Safety knives', 'marine-knives-safety-knives-2', 'Safety knives — professional grade knives for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-knives'), 'each', true, 0, false, true, ARRAY['marine','k','knives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-K-038-03', 'Rescue knives', 'marine-knives-rescue-knives-3', 'Rescue knives — professional grade knives for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-knives'), 'each', true, 0, false, true, ARRAY['marine','k','knives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Liferafts', 'marine-liferafts', 'Liferafts', 39, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-039-01', 'Inflatable emergency survival rafts', 'marine-liferafts-inflatable-emergency-survival-rafts-1', 'Inflatable emergency survival rafts — professional grade liferafts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-liferafts'), 'each', true, 0, true, true, ARRAY['marine','l','liferafts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Lifebuoys', 'marine-lifebuoys', 'Lifebuoys', 40, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-040-01', 'Ring buoys with lights', 'marine-lifebuoys-ring-buoys-with-lights-1', 'Ring buoys with lights — professional grade lifebuoys for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lifebuoys'), 'each', true, 0, true, true, ARRAY['marine','l','lifebuoys'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-040-02', 'Ring buoys with smoke signals', 'marine-lifebuoys-ring-buoys-with-smoke-signals-2', 'Ring buoys with smoke signals — professional grade lifebuoys for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lifebuoys'), 'each', true, 0, false, true, ARRAY['marine','l','lifebuoys'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Lubricants', 'marine-lubricants', 'Lubricants', 41, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-041-01', 'Engine oils', 'marine-lubricants-engine-oils-1', 'Engine oils — professional grade lubricants for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lubricants'), 'each', true, 0, true, true, ARRAY['marine','l','lubricants'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-041-02', 'Gear oils', 'marine-lubricants-gear-oils-2', 'Gear oils — professional grade lubricants for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lubricants'), 'each', true, 0, false, true, ARRAY['marine','l','lubricants'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-041-03', 'Hydraulic oils', 'marine-lubricants-hydraulic-oils-3', 'Hydraulic oils — professional grade lubricants for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lubricants'), 'each', true, 0, false, true, ARRAY['marine','l','lubricants'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-041-04', 'Greases', 'marine-lubricants-greases-4', 'Greases — professional grade lubricants for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-lubricants'), 'each', true, 0, false, true, ARRAY['marine','l','lubricants'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('LED Navigation Lights', 'marine-led-navigation-lights', 'LED Navigation Lights', 42, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-L-042-01', 'Marine-certified navigation lighting', 'marine-led-navigation-lights-marine-certified-navigation-lighting-1', 'Marine-certified navigation lighting — professional grade led navigation lights for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-led-navigation-lights'), 'each', true, 0, true, true, ARRAY['marine','l','led-navigation-lights'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Mooring Ropes', 'marine-mooring-ropes', 'Mooring Ropes', 43, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-043-01', 'Nylon ropes', 'marine-mooring-ropes-nylon-ropes-1', 'Nylon ropes — professional grade mooring ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-mooring-ropes'), 'each', true, 0, true, true, ARRAY['marine','m','mooring-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-043-02', 'Polypropylene ropes', 'marine-mooring-ropes-polypropylene-ropes-2', 'Polypropylene ropes — professional grade mooring ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-mooring-ropes'), 'each', true, 0, false, true, ARRAY['marine','m','mooring-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-043-03', 'HMPE ropes', 'marine-mooring-ropes-hmpe-ropes-3', 'HMPE ropes — professional grade mooring ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-mooring-ropes'), 'each', true, 0, false, true, ARRAY['marine','m','mooring-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-043-04', 'Polyester ropes', 'marine-mooring-ropes-polyester-ropes-4', 'Polyester ropes — professional grade mooring ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-mooring-ropes'), 'each', true, 0, false, true, ARRAY['marine','m','mooring-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Marine Paints', 'marine-marine-paints', 'Marine Paints', 44, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-044-01', 'Hull protective coatings', 'marine-marine-paints-hull-protective-coatings-1', 'Hull protective coatings — professional grade marine paints for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-marine-paints'), 'each', true, 0, true, true, ARRAY['marine','m','marine-paints'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-044-02', 'Structural protective coatings', 'marine-marine-paints-structural-protective-coatings-2', 'Structural protective coatings — professional grade marine paints for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-marine-paints'), 'each', true, 0, false, true, ARRAY['marine','m','marine-paints'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Marine Chemicals', 'marine-marine-chemicals', 'Marine Chemicals', 45, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-045-01', 'Water treatment chemicals', 'marine-marine-chemicals-water-treatment-chemicals-1', 'Water treatment chemicals — professional grade marine chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-marine-chemicals'), 'each', true, 0, true, true, ARRAY['marine','m','marine-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-045-02', 'Boiler chemicals', 'marine-marine-chemicals-boiler-chemicals-2', 'Boiler chemicals — professional grade marine chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-marine-chemicals'), 'each', true, 0, false, true, ARRAY['marine','m','marine-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-M-045-03', 'Marine cleaners', 'marine-marine-chemicals-marine-cleaners-3', 'Marine cleaners — professional grade marine chemicals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-marine-chemicals'), 'each', true, 0, false, true, ARRAY['marine','m','marine-chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Navigation Equipment', 'marine-navigation-equipment', 'Navigation Equipment', 46, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-N-046-01', 'Radar', 'marine-navigation-equipment-radar-1', 'Radar — professional grade navigation equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-navigation-equipment'), 'each', true, 0, true, true, ARRAY['marine','n','navigation-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-N-046-02', 'AIS', 'marine-navigation-equipment-ais-2', 'AIS — professional grade navigation equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-navigation-equipment'), 'each', true, 0, false, true, ARRAY['marine','n','navigation-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-N-046-03', 'GPS', 'marine-navigation-equipment-gps-3', 'GPS — professional grade navigation equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-navigation-equipment'), 'each', true, 0, false, true, ARRAY['marine','n','navigation-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-N-046-04', 'Echo Sounders', 'marine-navigation-equipment-echo-sounders-4', 'Echo Sounders — professional grade navigation equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-navigation-equipment'), 'each', true, 0, false, true, ARRAY['marine','n','navigation-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Nuts & Bolts', 'marine-nuts-bolts', 'Nuts & Bolts', 47, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-N-047-01', 'Marine-grade stainless steel fasteners', 'marine-nuts-bolts-marine-grade-stainless-steel-fasteners-1', 'Marine-grade stainless steel fasteners — professional grade nuts & bolts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-nuts-bolts'), 'each', true, 0, true, true, ARRAY['marine','n','nuts-bolts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Oil Separators', 'marine-oil-separators', 'Oil Separators', 48, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-O-048-01', 'Oily water separator systems', 'marine-oil-separators-oily-water-separator-systems-1', 'Oily water separator systems — professional grade oil separators for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-oil-separators'), 'each', true, 0, true, true, ARRAY['marine','o','oil-separators'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('O-rings', 'marine-o-rings', 'O-rings', 49, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-O-049-01', 'Rubber sealing rings', 'marine-o-rings-rubber-sealing-rings-1', 'Rubber sealing rings — professional grade o-rings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-o-rings'), 'each', true, 0, true, true, ARRAY['marine','o','o-rings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Outboard Motors', 'marine-outboard-motors', 'Outboard Motors', 50, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-O-050-01', 'Portable marine engines', 'marine-outboard-motors-portable-marine-engines-1', 'Portable marine engines — professional grade outboard motors for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-outboard-motors'), 'each', true, 0, true, true, ARRAY['marine','o','outboard-motors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Pumps', 'marine-pumps', 'Pumps', 51, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-051-01', 'Ballast pumps', 'marine-pumps-ballast-pumps-1', 'Ballast pumps — professional grade pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pumps'), 'each', true, 0, true, true, ARRAY['marine','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-051-02', 'Bilge pumps', 'marine-pumps-bilge-pumps-2', 'Bilge pumps — professional grade pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pumps'), 'each', true, 0, false, true, ARRAY['marine','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-051-03', 'Cargo pumps', 'marine-pumps-cargo-pumps-3', 'Cargo pumps — professional grade pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pumps'), 'each', true, 0, false, true, ARRAY['marine','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-051-04', 'Fire pumps', 'marine-pumps-fire-pumps-4', 'Fire pumps — professional grade pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pumps'), 'each', true, 0, false, true, ARRAY['marine','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-051-05', 'Sewage pumps', 'marine-pumps-sewage-pumps-5', 'Sewage pumps — professional grade pumps for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pumps'), 'each', true, 0, false, true, ARRAY['marine','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Propellers', 'marine-propellers', 'Propellers', 52, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-052-01', 'Bronze propellers', 'marine-propellers-bronze-propellers-1', 'Bronze propellers — professional grade propellers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-propellers'), 'each', true, 0, true, true, ARRAY['marine','p','propellers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-052-02', 'Stainless steel propellers', 'marine-propellers-stainless-steel-propellers-2', 'Stainless steel propellers — professional grade propellers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-propellers'), 'each', true, 0, false, true, ARRAY['marine','p','propellers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('PPE', 'marine-ppe', 'PPE', 53, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-053-01', 'Helmets', 'marine-ppe-helmets-1', 'Helmets — professional grade ppe for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ppe'), 'each', true, 0, true, true, ARRAY['marine','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-053-02', 'Gloves', 'marine-ppe-gloves-2', 'Gloves — professional grade ppe for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ppe'), 'each', true, 0, false, true, ARRAY['marine','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-053-03', 'Goggles', 'marine-ppe-goggles-3', 'Goggles — professional grade ppe for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ppe'), 'each', true, 0, false, true, ARRAY['marine','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-053-04', 'Coveralls', 'marine-ppe-coveralls-4', 'Coveralls — professional grade ppe for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ppe'), 'each', true, 0, false, true, ARRAY['marine','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-053-05', 'Boots', 'marine-ppe-boots-5', 'Boots — professional grade ppe for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ppe'), 'each', true, 0, false, true, ARRAY['marine','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Pressure Gauges', 'marine-pressure-gauges', 'Pressure Gauges', 54, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-054-01', 'Engine pressure monitoring', 'marine-pressure-gauges-engine-pressure-monitoring-1', 'Engine pressure monitoring — professional grade pressure gauges for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pressure-gauges'), 'each', true, 0, true, true, ARRAY['marine','p','pressure-gauges'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-P-054-02', 'Hydraulic pressure monitoring', 'marine-pressure-gauges-hydraulic-pressure-monitoring-2', 'Hydraulic pressure monitoring — professional grade pressure gauges for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-pressure-gauges'), 'each', true, 0, false, true, ARRAY['marine','p','pressure-gauges'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Quick Couplings', 'marine-quick-couplings', 'Quick Couplings', 55, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Q-055-01', 'Hydraulic connectors', 'marine-quick-couplings-hydraulic-connectors-1', 'Hydraulic connectors — professional grade quick couplings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-quick-couplings'), 'each', true, 0, true, true, ARRAY['marine','q','quick-couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Q-055-02', 'Pneumatic connectors', 'marine-quick-couplings-pneumatic-connectors-2', 'Pneumatic connectors — professional grade quick couplings for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-quick-couplings'), 'each', true, 0, false, true, ARRAY['marine','q','quick-couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Quick Release Hooks', 'marine-quick-release-hooks', 'Quick Release Hooks', 56, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Q-056-01', 'Mooring safety release systems', 'marine-quick-release-hooks-mooring-safety-release-systems-1', 'Mooring safety release systems — professional grade quick release hooks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-quick-release-hooks'), 'each', true, 0, true, true, ARRAY['marine','q','quick-release-hooks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Radar Systems', 'marine-radar-systems', 'Radar Systems', 57, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-R-057-01', 'Marine navigation radar', 'marine-radar-systems-marine-navigation-radar-1', 'Marine navigation radar — professional grade radar systems for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-radar-systems'), 'each', true, 0, true, true, ARRAY['marine','r','radar-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Rescue Equipment', 'marine-rescue-equipment', 'Rescue Equipment', 58, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-R-058-01', 'Rescue baskets', 'marine-rescue-equipment-rescue-baskets-1', 'Rescue baskets — professional grade rescue equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-rescue-equipment'), 'each', true, 0, true, true, ARRAY['marine','r','rescue-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-R-058-02', 'Stretchers', 'marine-rescue-equipment-stretchers-2', 'Stretchers — professional grade rescue equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-rescue-equipment'), 'each', true, 0, false, true, ARRAY['marine','r','rescue-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-R-058-03', 'Throw lines', 'marine-rescue-equipment-throw-lines-3', 'Throw lines — professional grade rescue equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-rescue-equipment'), 'each', true, 0, false, true, ARRAY['marine','r','rescue-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Rubber Sheets', 'marine-rubber-sheets', 'Rubber Sheets', 59, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-R-059-01', 'Industrial sealing materials', 'marine-rubber-sheets-industrial-sealing-materials-1', 'Industrial sealing materials — professional grade rubber sheets for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-rubber-sheets'), 'each', true, 0, true, true, ARRAY['marine','r','rubber-sheets'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Safety Equipment', 'marine-safety-equipment', 'Safety Equipment', 60, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-060-01', 'SOLAS compliant safety products', 'marine-safety-equipment-solas-compliant-safety-products-1', 'SOLAS compliant safety products — professional grade safety equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-safety-equipment'), 'each', true, 0, true, true, ARRAY['marine','s','safety-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-060-02', 'IMO compliant safety products', 'marine-safety-equipment-imo-compliant-safety-products-2', 'IMO compliant safety products — professional grade safety equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-safety-equipment'), 'each', true, 0, false, true, ARRAY['marine','s','safety-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Shackles', 'marine-shackles', 'Shackles', 61, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-061-01', 'Bow shackles', 'marine-shackles-bow-shackles-1', 'Bow shackles — professional grade shackles for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-shackles'), 'each', true, 0, true, true, ARRAY['marine','s','shackles'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-061-02', 'Dee shackles', 'marine-shackles-dee-shackles-2', 'Dee shackles — professional grade shackles for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-shackles'), 'each', true, 0, false, true, ARRAY['marine','s','shackles'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-061-03', 'Anchor shackles', 'marine-shackles-anchor-shackles-3', 'Anchor shackles — professional grade shackles for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-shackles'), 'each', true, 0, false, true, ARRAY['marine','s','shackles'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Seals', 'marine-seals', 'Seals', 62, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-062-01', 'Mechanical seals', 'marine-seals-mechanical-seals-1', 'Mechanical seals — professional grade seals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-seals'), 'each', true, 0, true, true, ARRAY['marine','s','seals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-062-02', 'Oil seals', 'marine-seals-oil-seals-2', 'Oil seals — professional grade seals for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-seals'), 'each', true, 0, false, true, ARRAY['marine','s','seals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Steering Systems', 'marine-steering-systems', 'Steering Systems', 63, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-063-01', 'Hydraulic steering gear', 'marine-steering-systems-hydraulic-steering-gear-1', 'Hydraulic steering gear — professional grade steering systems for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-steering-systems'), 'each', true, 0, true, true, ARRAY['marine','s','steering-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-063-02', 'Mechanical steering gear', 'marine-steering-systems-mechanical-steering-gear-2', 'Mechanical steering gear — professional grade steering systems for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-steering-systems'), 'each', true, 0, false, true, ARRAY['marine','s','steering-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Spare Parts', 'marine-spare-parts', 'Spare Parts', 64, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-064-01', 'OEM machinery spares', 'marine-spare-parts-oem-machinery-spares-1', 'OEM machinery spares — professional grade spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-spare-parts'), 'each', true, 0, true, true, ARRAY['marine','s','spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-S-064-02', 'Aftermarket machinery spares', 'marine-spare-parts-aftermarket-machinery-spares-2', 'Aftermarket machinery spares — professional grade spare parts for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-spare-parts'), 'each', true, 0, false, true, ARRAY['marine','s','spare-parts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Tools', 'marine-tools', 'Tools', 65, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-065-01', 'Hand tools', 'marine-tools-hand-tools-1', 'Hand tools — professional grade tools for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tools'), 'each', true, 0, true, true, ARRAY['marine','t','tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-065-02', 'Power tools', 'marine-tools-power-tools-2', 'Power tools — professional grade tools for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tools'), 'each', true, 0, false, true, ARRAY['marine','t','tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-065-03', 'Torque tools', 'marine-tools-torque-tools-3', 'Torque tools — professional grade tools for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tools'), 'each', true, 0, false, true, ARRAY['marine','t','tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Tanks', 'marine-tanks', 'Tanks', 66, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-066-01', 'Fuel tanks', 'marine-tanks-fuel-tanks-1', 'Fuel tanks — professional grade tanks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tanks'), 'each', true, 0, true, true, ARRAY['marine','t','tanks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-066-02', 'Freshwater tanks', 'marine-tanks-freshwater-tanks-2', 'Freshwater tanks — professional grade tanks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tanks'), 'each', true, 0, false, true, ARRAY['marine','t','tanks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-066-03', 'Sewage tanks', 'marine-tanks-sewage-tanks-3', 'Sewage tanks — professional grade tanks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tanks'), 'each', true, 0, false, true, ARRAY['marine','t','tanks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-066-04', 'Hydraulic tanks', 'marine-tanks-hydraulic-tanks-4', 'Hydraulic tanks — professional grade tanks for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-tanks'), 'each', true, 0, false, true, ARRAY['marine','t','tanks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Thermometers', 'marine-thermometers', 'Thermometers', 67, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-067-01', 'Engine monitoring instruments', 'marine-thermometers-engine-monitoring-instruments-1', 'Engine monitoring instruments — professional grade thermometers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-thermometers'), 'each', true, 0, true, true, ARRAY['marine','t','thermometers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Teak Care Products', 'marine-teak-care-products', 'Teak Care Products', 68, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-068-01', 'Teak cleaners', 'marine-teak-care-products-teak-cleaners-1', 'Teak cleaners — professional grade teak care products for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-teak-care-products'), 'each', true, 0, true, true, ARRAY['marine','t','teak-care-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-068-02', 'Teak oils', 'marine-teak-care-products-teak-oils-2', 'Teak oils — professional grade teak care products for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-teak-care-products'), 'each', true, 0, false, true, ARRAY['marine','t','teak-care-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-T-068-03', 'Teak sealers', 'marine-teak-care-products-teak-sealers-3', 'Teak sealers — professional grade teak care products for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-teak-care-products'), 'each', true, 0, false, true, ARRAY['marine','t','teak-care-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Ultrasonic Cleaners', 'marine-ultrasonic-cleaners', 'Ultrasonic Cleaners', 69, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-U-069-01', 'Precision cleaning equipment', 'marine-ultrasonic-cleaners-precision-cleaning-equipment-1', 'Precision cleaning equipment — professional grade ultrasonic cleaners for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ultrasonic-cleaners'), 'each', true, 0, true, true, ARRAY['marine','u','ultrasonic-cleaners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Underwater Lights', 'marine-underwater-lights', 'Underwater Lights', 70, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-U-070-01', 'Marine LED underwater lighting', 'marine-underwater-lights-marine-led-underwater-lighting-1', 'Marine LED underwater lighting — professional grade underwater lights for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-underwater-lights'), 'each', true, 0, true, true, ARRAY['marine','u','underwater-lights'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Valves', 'marine-valves', 'Valves', 71, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-071-01', 'Ball valves', 'marine-valves-ball-valves-1', 'Ball valves — professional grade valves for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-valves'), 'each', true, 0, true, true, ARRAY['marine','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-071-02', 'Globe valves', 'marine-valves-globe-valves-2', 'Globe valves — professional grade valves for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-valves'), 'each', true, 0, false, true, ARRAY['marine','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-071-03', 'Butterfly valves', 'marine-valves-butterfly-valves-3', 'Butterfly valves — professional grade valves for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-valves'), 'each', true, 0, false, true, ARRAY['marine','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-071-04', 'Gate valves', 'marine-valves-gate-valves-4', 'Gate valves — professional grade valves for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-valves'), 'each', true, 0, false, true, ARRAY['marine','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-071-05', 'Check valves', 'marine-valves-check-valves-5', 'Check valves — professional grade valves for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-valves'), 'each', true, 0, false, true, ARRAY['marine','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('VHF Radios', 'marine-vhf-radios', 'VHF Radios', 72, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-072-01', 'Marine communication systems', 'marine-vhf-radios-marine-communication-systems-1', 'Marine communication systems — professional grade vhf radios for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-vhf-radios'), 'each', true, 0, true, true, ARRAY['marine','v','vhf-radios'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Ventilation Fans', 'marine-ventilation-fans', 'Ventilation Fans', 73, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-V-073-01', 'Engine room ventilation', 'marine-ventilation-fans-engine-room-ventilation-1', 'Engine room ventilation — professional grade ventilation fans for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-ventilation-fans'), 'each', true, 0, true, true, ARRAY['marine','v','ventilation-fans'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Winches', 'marine-winches', 'Winches', 74, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-074-01', 'Anchor winches', 'marine-winches-anchor-winches-1', 'Anchor winches — professional grade winches for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-winches'), 'each', true, 0, true, true, ARRAY['marine','w','winches'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-074-02', 'Towing winches', 'marine-winches-towing-winches-2', 'Towing winches — professional grade winches for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-winches'), 'each', true, 0, false, true, ARRAY['marine','w','winches'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-074-03', 'Cargo handling winches', 'marine-winches-cargo-handling-winches-3', 'Cargo handling winches — professional grade winches for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-winches'), 'each', true, 0, false, true, ARRAY['marine','w','winches'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Watermakers', 'marine-watermakers', 'Watermakers', 75, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-075-01', 'Reverse osmosis freshwater generators', 'marine-watermakers-reverse-osmosis-freshwater-generators-1', 'Reverse osmosis freshwater generators — professional grade watermakers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-watermakers'), 'each', true, 0, true, true, ARRAY['marine','w','watermakers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Wire Ropes', 'marine-wire-ropes', 'Wire Ropes', 76, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-076-01', 'Galvanized wire ropes', 'marine-wire-ropes-galvanized-wire-ropes-1', 'Galvanized wire ropes — professional grade wire ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-wire-ropes'), 'each', true, 0, true, true, ARRAY['marine','w','wire-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-076-02', 'Stainless steel wire ropes', 'marine-wire-ropes-stainless-steel-wire-ropes-2', 'Stainless steel wire ropes — professional grade wire ropes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-wire-ropes'), 'each', true, 0, false, true, ARRAY['marine','w','wire-ropes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Welding Supplies', 'marine-welding-supplies', 'Welding Supplies', 77, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-077-01', 'Electrodes', 'marine-welding-supplies-electrodes-1', 'Electrodes — professional grade welding supplies for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-welding-supplies'), 'each', true, 0, true, true, ARRAY['marine','w','welding-supplies'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-077-02', 'Welding helmets', 'marine-welding-supplies-welding-helmets-2', 'Welding helmets — professional grade welding supplies for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-welding-supplies'), 'each', true, 0, false, true, ARRAY['marine','w','welding-supplies'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-W-077-03', 'Welding machines', 'marine-welding-supplies-welding-machines-3', 'Welding machines — professional grade welding supplies for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-welding-supplies'), 'each', true, 0, false, true, ARRAY['marine','w','welding-supplies'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('X-band Radar', 'marine-x-band-radar', 'X-band Radar', 78, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-X-078-01', 'X-band frequency marine radar', 'marine-x-band-radar-x-band-frequency-marine-radar-1', 'X-band frequency marine radar — professional grade x-band radar for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-x-band-radar'), 'each', true, 0, true, true, ARRAY['marine','x','x-band-radar'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Xenon Searchlights', 'marine-xenon-searchlights', 'Xenon Searchlights', 79, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-X-079-01', 'High-intensity marine searchlights', 'marine-xenon-searchlights-high-intensity-marine-searchlights-1', 'High-intensity marine searchlights — professional grade xenon searchlights for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-xenon-searchlights'), 'each', true, 0, true, true, ARRAY['marine','x','xenon-searchlights'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Yacht Equipment', 'marine-yacht-equipment', 'Yacht Equipment', 80, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Y-080-01', 'Premium yacht accessories', 'marine-yacht-equipment-premium-yacht-accessories-1', 'Premium yacht accessories — professional grade yacht equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-yacht-equipment'), 'each', true, 0, true, true, ARRAY['marine','y','yacht-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Y-080-02', 'Premium yacht fittings', 'marine-yacht-equipment-premium-yacht-fittings-2', 'Premium yacht fittings — professional grade yacht equipment for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-yacht-equipment'), 'each', true, 0, false, true, ARRAY['marine','y','yacht-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Y-Strainers', 'marine-y-strainers', 'Y-Strainers', 81, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Y-081-01', 'Pipeline filtration equipment', 'marine-y-strainers-pipeline-filtration-equipment-1', 'Pipeline filtration equipment — professional grade y-strainers for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-y-strainers'), 'each', true, 0, true, true, ARRAY['marine','y','y-strainers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Zinc Anodes', 'marine-zinc-anodes', 'Zinc Anodes', 82, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Z-082-01', 'Hull corrosion protection anodes', 'marine-zinc-anodes-hull-corrosion-protection-anodes-1', 'Hull corrosion protection anodes — professional grade zinc anodes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-zinc-anodes'), 'each', true, 0, true, true, ARRAY['marine','z','zinc-anodes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Z-082-02', 'Propeller corrosion protection anodes', 'marine-zinc-anodes-propeller-corrosion-protection-anodes-2', 'Propeller corrosion protection anodes — professional grade zinc anodes for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-zinc-anodes'), 'each', true, 0, false, true, ARRAY['marine','z','zinc-anodes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Zinc Spray', 'marine-zinc-spray', 'Zinc Spray', 83, 'marine', (SELECT id FROM categories WHERE slug = 'marine-supplies'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('MS-Z-083-01', 'Cold galvanizing anti-corrosion coating', 'marine-zinc-spray-cold-galvanizing-anti-corrosion-coating-1', 'Cold galvanizing anti-corrosion coating — professional grade zinc spray for marine applications.', (SELECT id FROM categories WHERE slug = 'marine-zinc-spray'), 'each', true, 0, true, true, ARRAY['marine','z','zinc-spray'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

-- Industrial Equipment
INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Industrial Equipment', 'industrial-equipment', 'Industrial Equipment catalogue', 2, 'industrial', NULL)
ON CONFLICT (slug) DO UPDATE SET division = EXCLUDED.division;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Air Equipment', 'industrial-air-equipment', 'Air Equipment', 1, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-01', 'Air Compressors', 'industrial-air-equipment-air-compressors-1', 'Air Compressors — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, true, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-02', 'Air Dryers', 'industrial-air-equipment-air-dryers-2', 'Air Dryers — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-03', 'Air Receivers', 'industrial-air-equipment-air-receivers-3', 'Air Receivers — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-04', 'Air Hoses', 'industrial-air-equipment-air-hoses-4', 'Air Hoses — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-05', 'Air Regulators', 'industrial-air-equipment-air-regulators-5', 'Air Regulators — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-06', 'Air Filters', 'industrial-air-equipment-air-filters-6', 'Air Filters — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-001-07', 'Air Tools', 'industrial-air-equipment-air-tools-7', 'Air Tools — professional grade air equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-air-equipment'), 'each', true, 0, false, true, ARRAY['industrial','a','air-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Abrasives', 'industrial-abrasives', 'Abrasives', 2, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-002-01', 'Grinding Wheels', 'industrial-abrasives-grinding-wheels-1', 'Grinding Wheels — professional grade abrasives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-abrasives'), 'each', true, 0, true, true, ARRAY['industrial','a','abrasives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-002-02', 'Sandpaper', 'industrial-abrasives-sandpaper-2', 'Sandpaper — professional grade abrasives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-abrasives'), 'each', true, 0, false, true, ARRAY['industrial','a','abrasives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-002-03', 'Flap Discs', 'industrial-abrasives-flap-discs-3', 'Flap Discs — professional grade abrasives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-abrasives'), 'each', true, 0, false, true, ARRAY['industrial','a','abrasives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-002-04', 'Wire Brushes', 'industrial-abrasives-wire-brushes-4', 'Wire Brushes — professional grade abrasives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-abrasives'), 'each', true, 0, false, true, ARRAY['industrial','a','abrasives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-002-05', 'Cutting Discs', 'industrial-abrasives-cutting-discs-5', 'Cutting Discs — professional grade abrasives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-abrasives'), 'each', true, 0, false, true, ARRAY['industrial','a','abrasives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Adhesives', 'industrial-adhesives', 'Adhesives', 3, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-003-01', 'Epoxy', 'industrial-adhesives-epoxy-1', 'Epoxy — professional grade adhesives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-adhesives'), 'each', true, 0, true, true, ARRAY['industrial','a','adhesives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-003-02', 'Thread Lockers', 'industrial-adhesives-thread-lockers-2', 'Thread Lockers — professional grade adhesives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-adhesives'), 'each', true, 0, false, true, ARRAY['industrial','a','adhesives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-003-03', 'Silicone Sealants', 'industrial-adhesives-silicone-sealants-3', 'Silicone Sealants — professional grade adhesives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-adhesives'), 'each', true, 0, false, true, ARRAY['industrial','a','adhesives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-A-003-04', 'PU Adhesives', 'industrial-adhesives-pu-adhesives-4', 'PU Adhesives — professional grade adhesives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-adhesives'), 'each', true, 0, false, true, ARRAY['industrial','a','adhesives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Bearings', 'industrial-bearings', 'Bearings', 4, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-004-01', 'Ball Bearings', 'industrial-bearings-ball-bearings-1', 'Ball Bearings — professional grade bearings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bearings'), 'each', true, 0, true, true, ARRAY['industrial','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-004-02', 'Roller Bearings', 'industrial-bearings-roller-bearings-2', 'Roller Bearings — professional grade bearings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bearings'), 'each', true, 0, false, true, ARRAY['industrial','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-004-03', 'Pillow Block Bearings', 'industrial-bearings-pillow-block-bearings-3', 'Pillow Block Bearings — professional grade bearings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bearings'), 'each', true, 0, false, true, ARRAY['industrial','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-004-04', 'Linear Bearings', 'industrial-bearings-linear-bearings-4', 'Linear Bearings — professional grade bearings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bearings'), 'each', true, 0, false, true, ARRAY['industrial','b','bearings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Bolts & Fasteners', 'industrial-bolts-fasteners', 'Bolts & Fasteners', 5, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-01', 'Bolts', 'industrial-bolts-fasteners-bolts-1', 'Bolts — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, true, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-02', 'Nuts', 'industrial-bolts-fasteners-nuts-2', 'Nuts — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, false, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-03', 'Washers', 'industrial-bolts-fasteners-washers-3', 'Washers — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, false, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-04', 'Studs', 'industrial-bolts-fasteners-studs-4', 'Studs — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, false, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-05', 'Rivets', 'industrial-bolts-fasteners-rivets-5', 'Rivets — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, false, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-005-06', 'Anchors', 'industrial-bolts-fasteners-anchors-6', 'Anchors — professional grade bolts & fasteners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-bolts-fasteners'), 'each', true, 0, false, true, ARRAY['industrial','b','bolts-fasteners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Belts', 'industrial-belts', 'Belts', 6, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-006-01', 'V-Belts', 'industrial-belts-v-belts-1', 'V-Belts — professional grade belts for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-belts'), 'each', true, 0, true, true, ARRAY['industrial','b','belts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-006-02', 'Timing Belts', 'industrial-belts-timing-belts-2', 'Timing Belts — professional grade belts for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-belts'), 'each', true, 0, false, true, ARRAY['industrial','b','belts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-B-006-03', 'Conveyor Belts', 'industrial-belts-conveyor-belts-3', 'Conveyor Belts — professional grade belts for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-belts'), 'each', true, 0, false, true, ARRAY['industrial','b','belts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Cutting Tools', 'industrial-cutting-tools', 'Cutting Tools', 7, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-007-01', 'Drill Bits', 'industrial-cutting-tools-drill-bits-1', 'Drill Bits — professional grade cutting tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cutting-tools'), 'each', true, 0, true, true, ARRAY['industrial','c','cutting-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-007-02', 'End Mills', 'industrial-cutting-tools-end-mills-2', 'End Mills — professional grade cutting tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cutting-tools'), 'each', true, 0, false, true, ARRAY['industrial','c','cutting-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-007-03', 'Hole Saws', 'industrial-cutting-tools-hole-saws-3', 'Hole Saws — professional grade cutting tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cutting-tools'), 'each', true, 0, false, true, ARRAY['industrial','c','cutting-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-007-04', 'Reamers', 'industrial-cutting-tools-reamers-4', 'Reamers — professional grade cutting tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cutting-tools'), 'each', true, 0, false, true, ARRAY['industrial','c','cutting-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-007-05', 'Taps & Dies', 'industrial-cutting-tools-taps-dies-5', 'Taps & Dies — professional grade cutting tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cutting-tools'), 'each', true, 0, false, true, ARRAY['industrial','c','cutting-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Chains', 'industrial-chains', 'Chains', 8, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-008-01', 'Roller Chains', 'industrial-chains-roller-chains-1', 'Roller Chains — professional grade chains for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chains'), 'each', true, 0, true, true, ARRAY['industrial','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-008-02', 'Conveyor Chains', 'industrial-chains-conveyor-chains-2', 'Conveyor Chains — professional grade chains for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chains'), 'each', true, 0, false, true, ARRAY['industrial','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-008-03', 'Lifting Chains', 'industrial-chains-lifting-chains-3', 'Lifting Chains — professional grade chains for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chains'), 'each', true, 0, false, true, ARRAY['industrial','c','chains'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Cables', 'industrial-cables', 'Cables', 9, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-009-01', 'Power Cables', 'industrial-cables-power-cables-1', 'Power Cables — professional grade cables for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cables'), 'each', true, 0, true, true, ARRAY['industrial','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-009-02', 'Control Cables', 'industrial-cables-control-cables-2', 'Control Cables — professional grade cables for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cables'), 'each', true, 0, false, true, ARRAY['industrial','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-009-03', 'Welding Cables', 'industrial-cables-welding-cables-3', 'Welding Cables — professional grade cables for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-cables'), 'each', true, 0, false, true, ARRAY['industrial','c','cables'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Chemicals', 'industrial-chemicals', 'Chemicals', 10, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-010-01', 'Degreasers', 'industrial-chemicals-degreasers-1', 'Degreasers — professional grade chemicals for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chemicals'), 'each', true, 0, true, true, ARRAY['industrial','c','chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-010-02', 'Solvents', 'industrial-chemicals-solvents-2', 'Solvents — professional grade chemicals for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chemicals'), 'each', true, 0, false, true, ARRAY['industrial','c','chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-010-03', 'Rust Removers', 'industrial-chemicals-rust-removers-3', 'Rust Removers — professional grade chemicals for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chemicals'), 'each', true, 0, false, true, ARRAY['industrial','c','chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-C-010-04', 'Lubricants', 'industrial-chemicals-lubricants-4', 'Lubricants — professional grade chemicals for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-chemicals'), 'each', true, 0, false, true, ARRAY['industrial','c','chemicals'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Drills', 'industrial-drills', 'Drills', 11, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-011-01', 'Magnetic Drills', 'industrial-drills-magnetic-drills-1', 'Magnetic Drills — professional grade drills for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-drills'), 'each', true, 0, true, true, ARRAY['industrial','d','drills'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-011-02', 'Hammer Drills', 'industrial-drills-hammer-drills-2', 'Hammer Drills — professional grade drills for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-drills'), 'each', true, 0, false, true, ARRAY['industrial','d','drills'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-011-03', 'Bench Drills', 'industrial-drills-bench-drills-3', 'Bench Drills — professional grade drills for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-drills'), 'each', true, 0, false, true, ARRAY['industrial','d','drills'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Dust Collection', 'industrial-dust-collection', 'Dust Collection', 12, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-012-01', 'Dust Extractors', 'industrial-dust-collection-dust-extractors-1', 'Dust Extractors — professional grade dust collection for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-dust-collection'), 'each', true, 0, true, true, ARRAY['industrial','d','dust-collection'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-012-02', 'Cyclones', 'industrial-dust-collection-cyclones-2', 'Cyclones — professional grade dust collection for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-dust-collection'), 'each', true, 0, false, true, ARRAY['industrial','d','dust-collection'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-012-03', 'Dust Filters', 'industrial-dust-collection-dust-filters-3', 'Dust Filters — professional grade dust collection for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-dust-collection'), 'each', true, 0, false, true, ARRAY['industrial','d','dust-collection'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Diesel Equipment', 'industrial-diesel-equipment', 'Diesel Equipment', 13, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-013-01', 'Fuel Pumps', 'industrial-diesel-equipment-fuel-pumps-1', 'Fuel Pumps — professional grade diesel equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-diesel-equipment'), 'each', true, 0, true, true, ARRAY['industrial','d','diesel-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-013-02', 'Fuel Tanks', 'industrial-diesel-equipment-fuel-tanks-2', 'Fuel Tanks — professional grade diesel equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-diesel-equipment'), 'each', true, 0, false, true, ARRAY['industrial','d','diesel-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-D-013-03', 'Fuel Filters', 'industrial-diesel-equipment-fuel-filters-3', 'Fuel Filters — professional grade diesel equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-diesel-equipment'), 'each', true, 0, false, true, ARRAY['industrial','d','diesel-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Electric Motors', 'industrial-electric-motors', 'Electric Motors', 14, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-014-01', 'AC Motors', 'industrial-electric-motors-ac-motors-1', 'AC Motors — professional grade electric motors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electric-motors'), 'each', true, 0, true, true, ARRAY['industrial','e','electric-motors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-014-02', 'DC Motors', 'industrial-electric-motors-dc-motors-2', 'DC Motors — professional grade electric motors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electric-motors'), 'each', true, 0, false, true, ARRAY['industrial','e','electric-motors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-014-03', 'Servo Motors', 'industrial-electric-motors-servo-motors-3', 'Servo Motors — professional grade electric motors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electric-motors'), 'each', true, 0, false, true, ARRAY['industrial','e','electric-motors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-014-04', 'Gear Motors', 'industrial-electric-motors-gear-motors-4', 'Gear Motors — professional grade electric motors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electric-motors'), 'each', true, 0, false, true, ARRAY['industrial','e','electric-motors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Electrical Equipment', 'industrial-electrical-equipment', 'Electrical Equipment', 15, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-015-01', 'MCCBs', 'industrial-electrical-equipment-mccbs-1', 'MCCBs — professional grade electrical equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electrical-equipment'), 'each', true, 0, true, true, ARRAY['industrial','e','electrical-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-015-02', 'MCBs', 'industrial-electrical-equipment-mcbs-2', 'MCBs — professional grade electrical equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electrical-equipment'), 'each', true, 0, false, true, ARRAY['industrial','e','electrical-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-015-03', 'Contactors', 'industrial-electrical-equipment-contactors-3', 'Contactors — professional grade electrical equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electrical-equipment'), 'each', true, 0, false, true, ARRAY['industrial','e','electrical-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-015-04', 'Relays', 'industrial-electrical-equipment-relays-4', 'Relays — professional grade electrical equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electrical-equipment'), 'each', true, 0, false, true, ARRAY['industrial','e','electrical-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-015-05', 'Switches', 'industrial-electrical-equipment-switches-5', 'Switches — professional grade electrical equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-electrical-equipment'), 'each', true, 0, false, true, ARRAY['industrial','e','electrical-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Extension Cords', 'industrial-extension-cords', 'Extension Cords', 16, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-E-016-01', 'Industrial Power Cords', 'industrial-extension-cords-industrial-power-cords-1', 'Industrial Power Cords — professional grade extension cords for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-extension-cords'), 'each', true, 0, true, true, ARRAY['industrial','e','extension-cords'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Fans', 'industrial-fans', 'Fans', 17, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-017-01', 'Axial Fans', 'industrial-fans-axial-fans-1', 'Axial Fans — professional grade fans for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-fans'), 'each', true, 0, true, true, ARRAY['industrial','f','fans'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-017-02', 'Centrifugal Fans', 'industrial-fans-centrifugal-fans-2', 'Centrifugal Fans — professional grade fans for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-fans'), 'each', true, 0, false, true, ARRAY['industrial','f','fans'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-017-03', 'Exhaust Fans', 'industrial-fans-exhaust-fans-3', 'Exhaust Fans — professional grade fans for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-fans'), 'each', true, 0, false, true, ARRAY['industrial','f','fans'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Filters', 'industrial-filters', 'Filters', 18, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-018-01', 'Hydraulic Filters', 'industrial-filters-hydraulic-filters-1', 'Hydraulic Filters — professional grade filters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-filters'), 'each', true, 0, true, true, ARRAY['industrial','f','filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-018-02', 'Air Filters', 'industrial-filters-air-filters-2', 'Air Filters — professional grade filters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-filters'), 'each', true, 0, false, true, ARRAY['industrial','f','filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-018-03', 'Fuel Filters', 'industrial-filters-fuel-filters-3', 'Fuel Filters — professional grade filters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-filters'), 'each', true, 0, false, true, ARRAY['industrial','f','filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-018-04', 'Oil Filters', 'industrial-filters-oil-filters-4', 'Oil Filters — professional grade filters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-filters'), 'each', true, 0, false, true, ARRAY['industrial','f','filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-018-05', 'Water Filters', 'industrial-filters-water-filters-5', 'Water Filters — professional grade filters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-filters'), 'each', true, 0, false, true, ARRAY['industrial','f','filters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Forklift Accessories', 'industrial-forklift-accessories', 'Forklift Accessories', 19, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-019-01', 'Fork Extensions', 'industrial-forklift-accessories-fork-extensions-1', 'Fork Extensions — professional grade forklift accessories for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-forklift-accessories'), 'each', true, 0, true, true, ARRAY['industrial','f','forklift-accessories'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-F-019-02', 'Fork Positioners', 'industrial-forklift-accessories-fork-positioners-2', 'Fork Positioners — professional grade forklift accessories for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-forklift-accessories'), 'each', true, 0, false, true, ARRAY['industrial','f','forklift-accessories'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Gearboxes', 'industrial-gearboxes', 'Gearboxes', 20, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-020-01', 'Helical Gearboxes', 'industrial-gearboxes-helical-gearboxes-1', 'Helical Gearboxes — professional grade gearboxes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-gearboxes'), 'each', true, 0, true, true, ARRAY['industrial','g','gearboxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-020-02', 'Worm Gearboxes', 'industrial-gearboxes-worm-gearboxes-2', 'Worm Gearboxes — professional grade gearboxes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-gearboxes'), 'each', true, 0, false, true, ARRAY['industrial','g','gearboxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-020-03', 'Planetary Gearboxes', 'industrial-gearboxes-planetary-gearboxes-3', 'Planetary Gearboxes — professional grade gearboxes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-gearboxes'), 'each', true, 0, false, true, ARRAY['industrial','g','gearboxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Generators', 'industrial-generators', 'Generators', 21, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-021-01', 'Diesel Generators', 'industrial-generators-diesel-generators-1', 'Diesel Generators — professional grade generators for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-generators'), 'each', true, 0, true, true, ARRAY['industrial','g','generators'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-021-02', 'Petrol Generators', 'industrial-generators-petrol-generators-2', 'Petrol Generators — professional grade generators for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-generators'), 'each', true, 0, false, true, ARRAY['industrial','g','generators'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Gauges', 'industrial-gauges', 'Gauges', 22, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-022-01', 'Pressure Gauges', 'industrial-gauges-pressure-gauges-1', 'Pressure Gauges — professional grade gauges for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-gauges'), 'each', true, 0, true, true, ARRAY['industrial','g','gauges'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-G-022-02', 'Temperature Gauges', 'industrial-gauges-temperature-gauges-2', 'Temperature Gauges — professional grade gauges for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-gauges'), 'each', true, 0, false, true, ARRAY['industrial','g','gauges'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hydraulic Equipment', 'industrial-hydraulic-equipment', 'Hydraulic Equipment', 23, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-023-01', 'Hydraulic Pumps', 'industrial-hydraulic-equipment-hydraulic-pumps-1', 'Hydraulic Pumps — professional grade hydraulic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hydraulic-equipment'), 'each', true, 0, true, true, ARRAY['industrial','h','hydraulic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-023-02', 'Hydraulic Cylinders', 'industrial-hydraulic-equipment-hydraulic-cylinders-2', 'Hydraulic Cylinders — professional grade hydraulic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hydraulic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','h','hydraulic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-023-03', 'Power Packs', 'industrial-hydraulic-equipment-power-packs-3', 'Power Packs — professional grade hydraulic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hydraulic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','h','hydraulic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-023-04', 'Hydraulic Valves', 'industrial-hydraulic-equipment-hydraulic-valves-4', 'Hydraulic Valves — professional grade hydraulic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hydraulic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','h','hydraulic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-023-05', 'Hydraulic Hoses', 'industrial-hydraulic-equipment-hydraulic-hoses-5', 'Hydraulic Hoses — professional grade hydraulic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hydraulic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','h','hydraulic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hand Tools', 'industrial-hand-tools', 'Hand Tools', 24, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-024-01', 'Wrenches', 'industrial-hand-tools-wrenches-1', 'Wrenches — professional grade hand tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hand-tools'), 'each', true, 0, true, true, ARRAY['industrial','h','hand-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-024-02', 'Pliers', 'industrial-hand-tools-pliers-2', 'Pliers — professional grade hand tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hand-tools'), 'each', true, 0, false, true, ARRAY['industrial','h','hand-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-024-03', 'Screwdrivers', 'industrial-hand-tools-screwdrivers-3', 'Screwdrivers — professional grade hand tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hand-tools'), 'each', true, 0, false, true, ARRAY['industrial','h','hand-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-024-04', 'Hammers', 'industrial-hand-tools-hammers-4', 'Hammers — professional grade hand tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hand-tools'), 'each', true, 0, false, true, ARRAY['industrial','h','hand-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Hoists', 'industrial-hoists', 'Hoists', 25, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-025-01', 'Electric Hoists', 'industrial-hoists-electric-hoists-1', 'Electric Hoists — professional grade hoists for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hoists'), 'each', true, 0, true, true, ARRAY['industrial','h','hoists'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-025-02', 'Chain Hoists', 'industrial-hoists-chain-hoists-2', 'Chain Hoists — professional grade hoists for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hoists'), 'each', true, 0, false, true, ARRAY['industrial','h','hoists'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-H-025-03', 'Lever Hoists', 'industrial-hoists-lever-hoists-3', 'Lever Hoists — professional grade hoists for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-hoists'), 'each', true, 0, false, true, ARRAY['industrial','h','hoists'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Industrial Lighting', 'industrial-industrial-lighting', 'Industrial Lighting', 26, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-026-01', 'LED Flood Lights', 'industrial-industrial-lighting-led-flood-lights-1', 'LED Flood Lights — professional grade industrial lighting for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-industrial-lighting'), 'each', true, 0, true, true, ARRAY['industrial','i','industrial-lighting'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-026-02', 'High Bay Lights', 'industrial-industrial-lighting-high-bay-lights-2', 'High Bay Lights — professional grade industrial lighting for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-industrial-lighting'), 'each', true, 0, false, true, ARRAY['industrial','i','industrial-lighting'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Inverters', 'industrial-inverters', 'Inverters', 27, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-027-01', 'VFDs', 'industrial-inverters-vfds-1', 'VFDs — professional grade inverters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-inverters'), 'each', true, 0, true, true, ARRAY['industrial','i','inverters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-027-02', 'Solar Inverters', 'industrial-inverters-solar-inverters-2', 'Solar Inverters — professional grade inverters for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-inverters'), 'each', true, 0, false, true, ARRAY['industrial','i','inverters'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Insulation', 'industrial-insulation', 'Insulation', 28, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-028-01', 'Pipe Insulation', 'industrial-insulation-pipe-insulation-1', 'Pipe Insulation — professional grade insulation for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-insulation'), 'each', true, 0, true, true, ARRAY['industrial','i','insulation'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-I-028-02', 'Thermal Insulation', 'industrial-insulation-thermal-insulation-2', 'Thermal Insulation — professional grade insulation for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-insulation'), 'each', true, 0, false, true, ARRAY['industrial','i','insulation'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Jacks', 'industrial-jacks', 'Jacks', 29, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-J-029-01', 'Hydraulic Bottle Jacks', 'industrial-jacks-hydraulic-bottle-jacks-1', 'Hydraulic Bottle Jacks — professional grade jacks for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-jacks'), 'each', true, 0, true, true, ARRAY['industrial','j','jacks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-J-029-02', 'Floor Jacks', 'industrial-jacks-floor-jacks-2', 'Floor Jacks — professional grade jacks for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-jacks'), 'each', true, 0, false, true, ARRAY['industrial','j','jacks'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Jib Cranes', 'industrial-jib-cranes', 'Jib Cranes', 30, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-J-030-01', 'Wall Mounted Jib Cranes', 'industrial-jib-cranes-wall-mounted-jib-cranes-1', 'Wall Mounted Jib Cranes — professional grade jib cranes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-jib-cranes'), 'each', true, 0, true, true, ARRAY['industrial','j','jib-cranes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-J-030-02', 'Free Standing Jib Cranes', 'industrial-jib-cranes-free-standing-jib-cranes-2', 'Free Standing Jib Cranes — professional grade jib cranes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-jib-cranes'), 'each', true, 0, false, true, ARRAY['industrial','j','jib-cranes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Knives', 'industrial-knives', 'Knives', 31, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-K-031-01', 'Utility Knives', 'industrial-knives-utility-knives-1', 'Utility Knives — professional grade knives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-knives'), 'each', true, 0, true, true, ARRAY['industrial','k','knives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-K-031-02', 'Industrial Blades', 'industrial-knives-industrial-blades-2', 'Industrial Blades — professional grade knives for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-knives'), 'each', true, 0, false, true, ARRAY['industrial','k','knives'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Key Stock', 'industrial-key-stock', 'Key Stock', 32, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-K-032-01', 'Shaft Keys', 'industrial-key-stock-shaft-keys-1', 'Shaft Keys — professional grade key stock for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-key-stock'), 'each', true, 0, true, true, ARRAY['industrial','k','key-stock'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-K-032-02', 'Key Bars', 'industrial-key-stock-key-bars-2', 'Key Bars — professional grade key stock for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-key-stock'), 'each', true, 0, false, true, ARRAY['industrial','k','key-stock'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Ladders', 'industrial-ladders', 'Ladders', 33, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-033-01', 'Aluminum Ladders', 'industrial-ladders-aluminum-ladders-1', 'Aluminum Ladders — professional grade ladders for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ladders'), 'each', true, 0, true, true, ARRAY['industrial','l','ladders'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-033-02', 'Fiberglass Ladders', 'industrial-ladders-fiberglass-ladders-2', 'Fiberglass Ladders — professional grade ladders for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ladders'), 'each', true, 0, false, true, ARRAY['industrial','l','ladders'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Lifting Equipment', 'industrial-lifting-equipment', 'Lifting Equipment', 34, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-034-01', 'Slings', 'industrial-lifting-equipment-slings-1', 'Slings — professional grade lifting equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lifting-equipment'), 'each', true, 0, true, true, ARRAY['industrial','l','lifting-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-034-02', 'Shackles', 'industrial-lifting-equipment-shackles-2', 'Shackles — professional grade lifting equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lifting-equipment'), 'each', true, 0, false, true, ARRAY['industrial','l','lifting-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-034-03', 'Hooks', 'industrial-lifting-equipment-hooks-3', 'Hooks — professional grade lifting equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lifting-equipment'), 'each', true, 0, false, true, ARRAY['industrial','l','lifting-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-034-04', 'Chain Blocks', 'industrial-lifting-equipment-chain-blocks-4', 'Chain Blocks — professional grade lifting equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lifting-equipment'), 'each', true, 0, false, true, ARRAY['industrial','l','lifting-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Lubrication Systems', 'industrial-lubrication-systems', 'Lubrication Systems', 35, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-035-01', 'Grease Guns', 'industrial-lubrication-systems-grease-guns-1', 'Grease Guns — professional grade lubrication systems for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lubrication-systems'), 'each', true, 0, true, true, ARRAY['industrial','l','lubrication-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-L-035-02', 'Oil Pumps', 'industrial-lubrication-systems-oil-pumps-2', 'Oil Pumps — professional grade lubrication systems for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-lubrication-systems'), 'each', true, 0, false, true, ARRAY['industrial','l','lubrication-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Measuring Tools', 'industrial-measuring-tools', 'Measuring Tools', 36, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-036-01', 'Calipers', 'industrial-measuring-tools-calipers-1', 'Calipers — professional grade measuring tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-measuring-tools'), 'each', true, 0, true, true, ARRAY['industrial','m','measuring-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-036-02', 'Micrometers', 'industrial-measuring-tools-micrometers-2', 'Micrometers — professional grade measuring tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-measuring-tools'), 'each', true, 0, false, true, ARRAY['industrial','m','measuring-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-036-03', 'Laser Measures', 'industrial-measuring-tools-laser-measures-3', 'Laser Measures — professional grade measuring tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-measuring-tools'), 'each', true, 0, false, true, ARRAY['industrial','m','measuring-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Machine Tools', 'industrial-machine-tools', 'Machine Tools', 37, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-037-01', 'Lathe', 'industrial-machine-tools-lathe-1', 'Lathe — professional grade machine tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-machine-tools'), 'each', true, 0, true, true, ARRAY['industrial','m','machine-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-037-02', 'Milling Machines', 'industrial-machine-tools-milling-machines-2', 'Milling Machines — professional grade machine tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-machine-tools'), 'each', true, 0, false, true, ARRAY['industrial','m','machine-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-037-03', 'CNC Machines', 'industrial-machine-tools-cnc-machines-3', 'CNC Machines — professional grade machine tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-machine-tools'), 'each', true, 0, false, true, ARRAY['industrial','m','machine-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Material Handling', 'industrial-material-handling', 'Material Handling', 38, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-038-01', 'Trolleys', 'industrial-material-handling-trolleys-1', 'Trolleys — professional grade material handling for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-material-handling'), 'each', true, 0, true, true, ARRAY['industrial','m','material-handling'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-038-02', 'Pallet Trucks', 'industrial-material-handling-pallet-trucks-2', 'Pallet Trucks — professional grade material handling for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-material-handling'), 'each', true, 0, false, true, ARRAY['industrial','m','material-handling'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-M-038-03', 'Carts', 'industrial-material-handling-carts-3', 'Carts — professional grade material handling for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-material-handling'), 'each', true, 0, false, true, ARRAY['industrial','m','material-handling'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Nozzles', 'industrial-nozzles', 'Nozzles', 39, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-N-039-01', 'Spray Nozzles', 'industrial-nozzles-spray-nozzles-1', 'Spray Nozzles — professional grade nozzles for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-nozzles'), 'each', true, 0, true, true, ARRAY['industrial','n','nozzles'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-N-039-02', 'Fuel Nozzles', 'industrial-nozzles-fuel-nozzles-2', 'Fuel Nozzles — professional grade nozzles for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-nozzles'), 'each', true, 0, false, true, ARRAY['industrial','n','nozzles'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Nuts', 'industrial-nuts', 'Nuts', 40, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-N-040-01', 'Stainless Nuts', 'industrial-nuts-stainless-nuts-1', 'Stainless Nuts — professional grade nuts for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-nuts'), 'each', true, 0, true, true, ARRAY['industrial','n','nuts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-N-040-02', 'Lock Nuts', 'industrial-nuts-lock-nuts-2', 'Lock Nuts — professional grade nuts for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-nuts'), 'each', true, 0, false, true, ARRAY['industrial','n','nuts'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Oil Equipment', 'industrial-oil-equipment', 'Oil Equipment', 41, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-041-01', 'Oil Pumps', 'industrial-oil-equipment-oil-pumps-1', 'Oil Pumps — professional grade oil equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-oil-equipment'), 'each', true, 0, true, true, ARRAY['industrial','o','oil-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-041-02', 'Oil Skimmers', 'industrial-oil-equipment-oil-skimmers-2', 'Oil Skimmers — professional grade oil equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-oil-equipment'), 'each', true, 0, false, true, ARRAY['industrial','o','oil-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-041-03', 'Oil Drainers', 'industrial-oil-equipment-oil-drainers-3', 'Oil Drainers — professional grade oil equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-oil-equipment'), 'each', true, 0, false, true, ARRAY['industrial','o','oil-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('O-Rings', 'industrial-o-rings', 'O-Rings', 42, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-042-01', 'Nitrile O-Rings', 'industrial-o-rings-nitrile-o-rings-1', 'Nitrile O-Rings — professional grade o-rings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-o-rings'), 'each', true, 0, true, true, ARRAY['industrial','o','o-rings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-042-02', 'Viton O-Rings', 'industrial-o-rings-viton-o-rings-2', 'Viton O-Rings — professional grade o-rings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-o-rings'), 'each', true, 0, false, true, ARRAY['industrial','o','o-rings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-O-042-03', 'EPDM O-Rings', 'industrial-o-rings-epdm-o-rings-3', 'EPDM O-Rings — professional grade o-rings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-o-rings'), 'each', true, 0, false, true, ARRAY['industrial','o','o-rings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Pumps', 'industrial-pumps', 'Pumps', 43, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-043-01', 'Centrifugal Pumps', 'industrial-pumps-centrifugal-pumps-1', 'Centrifugal Pumps — professional grade pumps for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pumps'), 'each', true, 0, true, true, ARRAY['industrial','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-043-02', 'Diaphragm Pumps', 'industrial-pumps-diaphragm-pumps-2', 'Diaphragm Pumps — professional grade pumps for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pumps'), 'each', true, 0, false, true, ARRAY['industrial','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-043-03', 'Gear Pumps', 'industrial-pumps-gear-pumps-3', 'Gear Pumps — professional grade pumps for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pumps'), 'each', true, 0, false, true, ARRAY['industrial','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-043-04', 'Vacuum Pumps', 'industrial-pumps-vacuum-pumps-4', 'Vacuum Pumps — professional grade pumps for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pumps'), 'each', true, 0, false, true, ARRAY['industrial','p','pumps'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Pneumatic Equipment', 'industrial-pneumatic-equipment', 'Pneumatic Equipment', 44, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-044-01', 'Air Cylinders', 'industrial-pneumatic-equipment-air-cylinders-1', 'Air Cylinders — professional grade pneumatic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pneumatic-equipment'), 'each', true, 0, true, true, ARRAY['industrial','p','pneumatic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-044-02', 'Pneumatic Valves', 'industrial-pneumatic-equipment-pneumatic-valves-2', 'Pneumatic Valves — professional grade pneumatic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pneumatic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','p','pneumatic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-044-03', 'FRL Units', 'industrial-pneumatic-equipment-frl-units-3', 'FRL Units — professional grade pneumatic equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pneumatic-equipment'), 'each', true, 0, false, true, ARRAY['industrial','p','pneumatic-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Pipes', 'industrial-pipes', 'Pipes', 45, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-045-01', 'PVC Pipes', 'industrial-pipes-pvc-pipes-1', 'PVC Pipes — professional grade pipes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pipes'), 'each', true, 0, true, true, ARRAY['industrial','p','pipes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-045-02', 'Steel Pipes', 'industrial-pipes-steel-pipes-2', 'Steel Pipes — professional grade pipes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pipes'), 'each', true, 0, false, true, ARRAY['industrial','p','pipes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-045-03', 'Copper Pipes', 'industrial-pipes-copper-pipes-3', 'Copper Pipes — professional grade pipes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pipes'), 'each', true, 0, false, true, ARRAY['industrial','p','pipes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-045-04', 'Stainless Pipes', 'industrial-pipes-stainless-pipes-4', 'Stainless Pipes — professional grade pipes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-pipes'), 'each', true, 0, false, true, ARRAY['industrial','p','pipes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('PPE', 'industrial-ppe', 'PPE', 46, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-046-01', 'Helmets', 'industrial-ppe-helmets-1', 'Helmets — professional grade ppe for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ppe'), 'each', true, 0, true, true, ARRAY['industrial','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-046-02', 'Gloves', 'industrial-ppe-gloves-2', 'Gloves — professional grade ppe for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ppe'), 'each', true, 0, false, true, ARRAY['industrial','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-046-03', 'Safety Shoes', 'industrial-ppe-safety-shoes-3', 'Safety Shoes — professional grade ppe for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ppe'), 'each', true, 0, false, true, ARRAY['industrial','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-P-046-04', 'Goggles', 'industrial-ppe-goggles-4', 'Goggles — professional grade ppe for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ppe'), 'each', true, 0, false, true, ARRAY['industrial','p','ppe'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Quick Couplings', 'industrial-quick-couplings', 'Quick Couplings', 47, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Q-047-01', 'Hydraulic Quick Connectors', 'industrial-quick-couplings-hydraulic-quick-connectors-1', 'Hydraulic Quick Connectors — professional grade quick couplings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-quick-couplings'), 'each', true, 0, true, true, ARRAY['industrial','q','quick-couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Q-047-02', 'Pneumatic Quick Connectors', 'industrial-quick-couplings-pneumatic-quick-connectors-2', 'Pneumatic Quick Connectors — professional grade quick couplings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-quick-couplings'), 'each', true, 0, false, true, ARRAY['industrial','q','quick-couplings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Rollers', 'industrial-rollers', 'Rollers', 48, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-048-01', 'Conveyor Rollers', 'industrial-rollers-conveyor-rollers-1', 'Conveyor Rollers — professional grade rollers for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-rollers'), 'each', true, 0, true, true, ARRAY['industrial','r','rollers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-048-02', 'Paint Rollers', 'industrial-rollers-paint-rollers-2', 'Paint Rollers — professional grade rollers for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-rollers'), 'each', true, 0, false, true, ARRAY['industrial','r','rollers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Rope', 'industrial-rope', 'Rope', 49, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-049-01', 'Nylon Rope', 'industrial-rope-nylon-rope-1', 'Nylon Rope — professional grade rope for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-rope'), 'each', true, 0, true, true, ARRAY['industrial','r','rope'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-049-02', 'Polyester Rope', 'industrial-rope-polyester-rope-2', 'Polyester Rope — professional grade rope for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-rope'), 'each', true, 0, false, true, ARRAY['industrial','r','rope'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-049-03', 'Wire Rope', 'industrial-rope-wire-rope-3', 'Wire Rope — professional grade rope for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-rope'), 'each', true, 0, false, true, ARRAY['industrial','r','rope'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Respirators', 'industrial-respirators', 'Respirators', 50, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-050-01', 'Dust Masks', 'industrial-respirators-dust-masks-1', 'Dust Masks — professional grade respirators for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-respirators'), 'each', true, 0, true, true, ARRAY['industrial','r','respirators'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-R-050-02', 'Half Face Respirators', 'industrial-respirators-half-face-respirators-2', 'Half Face Respirators — professional grade respirators for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-respirators'), 'each', true, 0, false, true, ARRAY['industrial','r','respirators'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Safety Equipment', 'industrial-safety-equipment', 'Safety Equipment', 51, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-051-01', 'Fire Extinguishers', 'industrial-safety-equipment-fire-extinguishers-1', 'Fire Extinguishers — professional grade safety equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-safety-equipment'), 'each', true, 0, true, true, ARRAY['industrial','s','safety-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-051-02', 'Spill Kits', 'industrial-safety-equipment-spill-kits-2', 'Spill Kits — professional grade safety equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-safety-equipment'), 'each', true, 0, false, true, ARRAY['industrial','s','safety-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-051-03', 'Eye Wash Stations', 'industrial-safety-equipment-eye-wash-stations-3', 'Eye Wash Stations — professional grade safety equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-safety-equipment'), 'each', true, 0, false, true, ARRAY['industrial','s','safety-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Sensors', 'industrial-sensors', 'Sensors', 52, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-052-01', 'Proximity Sensors', 'industrial-sensors-proximity-sensors-1', 'Proximity Sensors — professional grade sensors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-sensors'), 'each', true, 0, true, true, ARRAY['industrial','s','sensors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-052-02', 'Temperature Sensors', 'industrial-sensors-temperature-sensors-2', 'Temperature Sensors — professional grade sensors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-sensors'), 'each', true, 0, false, true, ARRAY['industrial','s','sensors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-052-03', 'Pressure Sensors', 'industrial-sensors-pressure-sensors-3', 'Pressure Sensors — professional grade sensors for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-sensors'), 'each', true, 0, false, true, ARRAY['industrial','s','sensors'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Steel Products', 'industrial-steel-products', 'Steel Products', 53, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-053-01', 'Flat Bars', 'industrial-steel-products-flat-bars-1', 'Flat Bars — professional grade steel products for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-steel-products'), 'each', true, 0, true, true, ARRAY['industrial','s','steel-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-053-02', 'Round Bars', 'industrial-steel-products-round-bars-2', 'Round Bars — professional grade steel products for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-steel-products'), 'each', true, 0, false, true, ARRAY['industrial','s','steel-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-053-03', 'Angles', 'industrial-steel-products-angles-3', 'Angles — professional grade steel products for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-steel-products'), 'each', true, 0, false, true, ARRAY['industrial','s','steel-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-053-04', 'Channels', 'industrial-steel-products-channels-4', 'Channels — professional grade steel products for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-steel-products'), 'each', true, 0, false, true, ARRAY['industrial','s','steel-products'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Storage', 'industrial-storage', 'Storage', 54, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-054-01', 'Tool Cabinets', 'industrial-storage-tool-cabinets-1', 'Tool Cabinets — professional grade storage for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-storage'), 'each', true, 0, true, true, ARRAY['industrial','s','storage'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-054-02', 'Shelving', 'industrial-storage-shelving-2', 'Shelving — professional grade storage for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-storage'), 'each', true, 0, false, true, ARRAY['industrial','s','storage'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-S-054-03', 'Lockers', 'industrial-storage-lockers-3', 'Lockers — professional grade storage for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-storage'), 'each', true, 0, false, true, ARRAY['industrial','s','storage'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Toolboxes', 'industrial-toolboxes', 'Toolboxes', 55, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-055-01', 'Portable Tool Boxes', 'industrial-toolboxes-portable-tool-boxes-1', 'Portable Tool Boxes — professional grade toolboxes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-toolboxes'), 'each', true, 0, true, true, ARRAY['industrial','t','toolboxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-055-02', 'Tool Cabinets', 'industrial-toolboxes-tool-cabinets-2', 'Tool Cabinets — professional grade toolboxes for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-toolboxes'), 'each', true, 0, false, true, ARRAY['industrial','t','toolboxes'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Torque Tools', 'industrial-torque-tools', 'Torque Tools', 56, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-056-01', 'Torque Wrenches', 'industrial-torque-tools-torque-wrenches-1', 'Torque Wrenches — professional grade torque tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-torque-tools'), 'each', true, 0, true, true, ARRAY['industrial','t','torque-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-056-02', 'Torque Multipliers', 'industrial-torque-tools-torque-multipliers-2', 'Torque Multipliers — professional grade torque tools for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-torque-tools'), 'each', true, 0, false, true, ARRAY['industrial','t','torque-tools'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Test Equipment', 'industrial-test-equipment', 'Test Equipment', 57, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-057-01', 'Multimeters', 'industrial-test-equipment-multimeters-1', 'Multimeters — professional grade test equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-test-equipment'), 'each', true, 0, true, true, ARRAY['industrial','t','test-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-057-02', 'Clamp Meters', 'industrial-test-equipment-clamp-meters-2', 'Clamp Meters — professional grade test equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-test-equipment'), 'each', true, 0, false, true, ARRAY['industrial','t','test-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-T-057-03', 'Oscilloscopes', 'industrial-test-equipment-oscilloscopes-3', 'Oscilloscopes — professional grade test equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-test-equipment'), 'each', true, 0, false, true, ARRAY['industrial','t','test-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Ultrasonic Cleaners', 'industrial-ultrasonic-cleaners', 'Ultrasonic Cleaners', 58, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-U-058-01', 'Industrial Cleaning Machines', 'industrial-ultrasonic-cleaners-industrial-cleaning-machines-1', 'Industrial Cleaning Machines — professional grade ultrasonic cleaners for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ultrasonic-cleaners'), 'each', true, 0, true, true, ARRAY['industrial','u','ultrasonic-cleaners'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('UPS Systems', 'industrial-ups-systems', 'UPS Systems', 59, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-U-059-01', 'Uninterruptible Power Supplies', 'industrial-ups-systems-uninterruptible-power-supplies-1', 'Uninterruptible Power Supplies — professional grade ups systems for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-ups-systems'), 'each', true, 0, true, true, ARRAY['industrial','u','ups-systems'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Valves', 'industrial-valves', 'Valves', 60, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-060-01', 'Ball Valves', 'industrial-valves-ball-valves-1', 'Ball Valves — professional grade valves for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-valves'), 'each', true, 0, true, true, ARRAY['industrial','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-060-02', 'Butterfly Valves', 'industrial-valves-butterfly-valves-2', 'Butterfly Valves — professional grade valves for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-valves'), 'each', true, 0, false, true, ARRAY['industrial','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-060-03', 'Globe Valves', 'industrial-valves-globe-valves-3', 'Globe Valves — professional grade valves for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-valves'), 'each', true, 0, false, true, ARRAY['industrial','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-060-04', 'Gate Valves', 'industrial-valves-gate-valves-4', 'Gate Valves — professional grade valves for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-valves'), 'each', true, 0, false, true, ARRAY['industrial','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-060-05', 'Check Valves', 'industrial-valves-check-valves-5', 'Check Valves — professional grade valves for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-valves'), 'each', true, 0, false, true, ARRAY['industrial','v','valves'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Vacuum Equipment', 'industrial-vacuum-equipment', 'Vacuum Equipment', 61, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-061-01', 'Vacuum Pumps', 'industrial-vacuum-equipment-vacuum-pumps-1', 'Vacuum Pumps — professional grade vacuum equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-vacuum-equipment'), 'each', true, 0, true, true, ARRAY['industrial','v','vacuum-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-V-061-02', 'Industrial Vacuums', 'industrial-vacuum-equipment-industrial-vacuums-2', 'Industrial Vacuums — professional grade vacuum equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-vacuum-equipment'), 'each', true, 0, false, true, ARRAY['industrial','v','vacuum-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Welding Equipment', 'industrial-welding-equipment', 'Welding Equipment', 62, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-062-01', 'MIG Welders', 'industrial-welding-equipment-mig-welders-1', 'MIG Welders — professional grade welding equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-welding-equipment'), 'each', true, 0, true, true, ARRAY['industrial','w','welding-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-062-02', 'TIG Welders', 'industrial-welding-equipment-tig-welders-2', 'TIG Welders — professional grade welding equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-welding-equipment'), 'each', true, 0, false, true, ARRAY['industrial','w','welding-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-062-03', 'Stick Welders', 'industrial-welding-equipment-stick-welders-3', 'Stick Welders — professional grade welding equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-welding-equipment'), 'each', true, 0, false, true, ARRAY['industrial','w','welding-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-062-04', 'Plasma Cutters', 'industrial-welding-equipment-plasma-cutters-4', 'Plasma Cutters — professional grade welding equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-welding-equipment'), 'each', true, 0, false, true, ARRAY['industrial','w','welding-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Wheels', 'industrial-wheels', 'Wheels', 63, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-063-01', 'Caster Wheels', 'industrial-wheels-caster-wheels-1', 'Caster Wheels — professional grade wheels for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-wheels'), 'each', true, 0, true, true, ARRAY['industrial','w','wheels'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-063-02', 'Industrial Wheels', 'industrial-wheels-industrial-wheels-2', 'Industrial Wheels — professional grade wheels for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-wheels'), 'each', true, 0, false, true, ARRAY['industrial','w','wheels'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Washers', 'industrial-washers', 'Washers', 64, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-064-01', 'Flat Washers', 'industrial-washers-flat-washers-1', 'Flat Washers — professional grade washers for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-washers'), 'each', true, 0, true, true, ARRAY['industrial','w','washers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-W-064-02', 'Spring Washers', 'industrial-washers-spring-washers-2', 'Spring Washers — professional grade washers for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-washers'), 'each', true, 0, false, true, ARRAY['industrial','w','washers'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('X-Ray Equipment', 'industrial-x-ray-equipment', 'X-Ray Equipment', 65, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-X-065-01', 'Industrial NDT X-Ray Machines', 'industrial-x-ray-equipment-industrial-ndt-x-ray-machines-1', 'Industrial NDT X-Ray Machines — professional grade x-ray equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-x-ray-equipment'), 'each', true, 0, true, true, ARRAY['industrial','x','x-ray-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Yard Equipment', 'industrial-yard-equipment', 'Yard Equipment', 66, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Y-066-01', 'Pressure Washers', 'industrial-yard-equipment-pressure-washers-1', 'Pressure Washers — professional grade yard equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-yard-equipment'), 'each', true, 0, true, true, ARRAY['industrial','y','yard-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Y-066-02', 'Lawn Equipment', 'industrial-yard-equipment-lawn-equipment-2', 'Lawn Equipment — professional grade yard equipment for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-yard-equipment'), 'each', true, 0, false, true, ARRAY['industrial','y','yard-equipment'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;

INSERT INTO categories (name, slug, description, sort_order, division, parent_id)
VALUES ('Zinc Coatings', 'industrial-zinc-coatings', 'Zinc Coatings', 67, 'industrial', (SELECT id FROM categories WHERE slug = 'industrial-equipment'))
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Z-067-01', 'Cold Galvanizing Spray', 'industrial-zinc-coatings-cold-galvanizing-spray-1', 'Cold Galvanizing Spray — professional grade zinc coatings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-zinc-coatings'), 'each', true, 0, true, true, ARRAY['industrial','z','zinc-coatings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)
VALUES ('IE-Z-067-02', 'Zinc Paint', 'industrial-zinc-coatings-zinc-paint-2', 'Zinc Paint — professional grade zinc coatings for industrial applications.', (SELECT id FROM categories WHERE slug = 'industrial-zinc-coatings'), 'each', true, 0, false, true, ARRAY['industrial','z','zinc-coatings'])
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;
-- Public read policies (so storefront can load products)
DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products FOR SELECT USING (is_active = true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Marine products: 181
-- Industrial products: 199
-- Total products: 380
