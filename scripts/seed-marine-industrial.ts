/**
 * Seed Marine Supplies and Industrial Equipment catalogues.
 * Run: npm run seed:catalogue
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { MARINE_CATALOGUE } from '../config/catalogue/marine';
import { INDUSTRIAL_CATALOGUE } from '../config/catalogue/industrial';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = resolve(__dirname, '../.env.local');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type Division = 'marine' | 'industrial';

type SchemaFlags = {
  categoryDivision: boolean;
  categoryParentId: boolean;
  productTags: boolean;
};

async function detectSchema(): Promise<SchemaFlags> {
  const [{ error: divErr }, { error: parentErr }, { error: tagsErr }] = await Promise.all([
    supabase.from('categories').select('division').limit(1),
    supabase.from('categories').select('parent_id').limit(1),
    supabase.from('products').select('tags').limit(1),
  ]);

  const flags = {
    categoryDivision: !divErr,
    categoryParentId: !parentErr,
    productTags: !tagsErr,
  };

  console.log('Schema:', flags);
  return flags;
}

async function upsertCategory(
  row: Record<string, unknown>,
  flags: SchemaFlags,
): Promise<string> {
  const payload: Record<string, unknown> = { ...row };
  if (!flags.categoryDivision) delete payload.division;
  if (!flags.categoryParentId) delete payload.parent_id;

  const { data, error } = await supabase
    .from('categories')
    .upsert(payload, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

async function upsertProducts(
  products: Record<string, unknown>[],
  flags: SchemaFlags,
) {
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map((p) => {
      const row = { ...p };
      if (!flags.productTags) delete row.tags;
      return row;
    });

    let { error } = await supabase.from('products').upsert(batch, { onConflict: 'sku' });
    if (error) {
      ({ error } = await supabase.from('products').upsert(batch, { onConflict: 'slug' }));
    }
    if (error) throw error;
    console.log(`  Upserted ${Math.min(i + batchSize, products.length)}/${products.length}`);
  }
}

async function seedDivision(
  division: Division,
  catalogue: typeof MARINE_CATALOGUE,
  flags: SchemaFlags,
) {
  let sortOrder = 0;
  const products: Record<string, unknown>[] = [];

  for (const entry of catalogue) {
    sortOrder += 1;
    const subSlug = `${division}-${slugify(entry.subcategory)}`;

    const categoryRow: Record<string, unknown> = {
      name: entry.subcategory,
      slug: subSlug,
      description: `${entry.subcategory} — ${division}`,
      sort_order: sortOrder,
    };
    if (flags.categoryDivision) categoryRow.division = division;

    const categoryId = await upsertCategory(categoryRow, flags);
    const prefix = division === 'marine' ? 'MS' : 'IE';

    entry.products.forEach((productName, index) => {
      const baseSlug = slugify(`${division}-${entry.subcategory}-${productName}`);
      products.push({
        sku: `${prefix}-${entry.letter}-${String(sortOrder).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`,
        name: productName,
        slug: `${baseSlug}-${index + 1}`,
        description: `${productName} — ${entry.subcategory} for ${division} applications.`,
        category_id: categoryId,
        unit: 'each',
        in_stock: true,
        stock_quantity: 0,
        featured: index === 0,
        is_active: true,
        tags: [division, entry.letter.toLowerCase(), slugify(entry.subcategory)],
      });
    });
  }

  await upsertProducts(products, flags);
  return products.length;
}

async function main() {
  const flags = await detectSchema();

  console.log('Seeding Marine Supplies...');
  const marineCount = await seedDivision('marine', MARINE_CATALOGUE, flags);
  console.log(`✓ Marine: ${marineCount} products`);

  console.log('Seeding Industrial Equipment...');
  const industrialCount = await seedDivision('industrial', INDUSTRIAL_CATALOGUE, flags);
  console.log(`✓ Industrial: ${industrialCount} products`);

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`\nDone. Seeded ${marineCount + industrialCount} catalogue products.`);
  console.log(`Active products in database: ${count ?? 'unknown'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
