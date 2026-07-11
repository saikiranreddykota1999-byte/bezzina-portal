/**
 * Generate SQL seed for marine + industrial catalogues.
 * Run: npx tsx scripts/generate-catalogue-sql.ts
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MARINE_CATALOGUE } from '../config/catalogue/marine';
import { INDUSTRIAL_CATALOGUE } from '../config/catalogue/industrial';

const __dirname = dirname(fileURLToPath(import.meta.url));

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function esc(text: string): string {
  return text.replace(/'/g, "''");
}

type Division = 'marine' | 'industrial';

function generateDivision(division: Division, catalogue: typeof MARINE_CATALOGUE) {
  const lines: string[] = [];
  const parentName = division === 'marine' ? 'Marine Supplies' : 'Industrial Equipment';
  const parentSlug = division === 'marine' ? 'marine-supplies' : 'industrial-equipment';
  const prefix = division === 'marine' ? 'MS' : 'IE';

  lines.push(`-- ${parentName}`);
  lines.push(`INSERT INTO categories (name, slug, description, sort_order, division, parent_id)`);
  lines.push(`VALUES ('${esc(parentName)}', '${parentSlug}', '${esc(parentName + ' catalogue')}', ${division === 'marine' ? 1 : 2}, '${division}', NULL)`);
  lines.push(`ON CONFLICT (slug) DO UPDATE SET division = EXCLUDED.division;`);

  let sortOrder = 0;
  for (const entry of catalogue) {
    sortOrder += 1;
    const subSlug = `${division}-${slugify(entry.subcategory)}`;
    lines.push('');
    lines.push(`INSERT INTO categories (name, slug, description, sort_order, division, parent_id)`);
    lines.push(`VALUES ('${esc(entry.subcategory)}', '${subSlug}', '${esc(entry.subcategory)}', ${sortOrder}, '${division}', (SELECT id FROM categories WHERE slug = '${parentSlug}'))`);
    lines.push(`ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, division = EXCLUDED.division;`);

    for (let i = 0; i < entry.products.length; i++) {
      const productName = entry.products[i];
      const sku = `${prefix}-${entry.letter}-${String(sortOrder).padStart(3, '0')}-${String(i + 1).padStart(2, '0')}`;
      const slug = `${slugify(`${division}-${entry.subcategory}-${productName}`)}-${i + 1}`;
      const desc = `${productName} — professional grade ${entry.subcategory.toLowerCase()} for ${division} applications.`;

      lines.push(`INSERT INTO products (sku, name, slug, description, category_id, unit, in_stock, stock_quantity, featured, is_active, tags)`);
      lines.push(`VALUES ('${sku}', '${esc(productName)}', '${slug}', '${esc(desc)}', (SELECT id FROM categories WHERE slug = '${subSlug}'), 'each', true, 0, ${i === 0}, true, ARRAY['${division}','${entry.letter.toLowerCase()}','${slugify(entry.subcategory)}'])`);
      lines.push(`ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, is_active = true;`);
    }
  }

  return lines;
}

const marine = generateDivision('marine', MARINE_CATALOGUE);
const industrial = generateDivision('industrial', INDUSTRIAL_CATALOGUE);

const header = `-- Bezzina Portal: Schema prep + Marine & Industrial catalogue seed
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

`;

const footer = `
-- Public read policies (so storefront can load products)
DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products FOR SELECT USING (is_active = true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Marine products: ${MARINE_CATALOGUE.reduce((s, e) => s + e.products.length, 0)}
-- Industrial products: ${INDUSTRIAL_CATALOGUE.reduce((s, e) => s + e.products.length, 0)}
-- Total products: ${MARINE_CATALOGUE.reduce((s, e) => s + e.products.length, 0) + INDUSTRIAL_CATALOGUE.reduce((s, e) => s + e.products.length, 0)}
`;

const sql = header + marine.join('\n') + '\n\n' + industrial.join('\n') + footer;
const outPath = resolve(__dirname, '../supabase/seed_catalogue_data.sql');
writeFileSync(outPath, sql, 'utf-8');
console.log(`Written ${outPath} (${sql.length} bytes)`);
