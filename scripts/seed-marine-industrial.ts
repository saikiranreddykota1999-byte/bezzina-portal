/**
 * Seed Marine Supplies and Industrial Equipment catalogues.
 * Run: npx tsx scripts/seed-marine-industrial.ts
 */
import { createClient } from '@supabase/supabase-js';
import { MARINE_CATALOGUE } from '../config/catalogue/marine';
import { INDUSTRIAL_CATALOGUE } from '../config/catalogue/industrial';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type Division = 'marine' | 'industrial';

async function upsertParent(division: Division) {
  const name = division === 'marine' ? 'Marine Supplies' : 'Industrial Equipment';
  const slug = division === 'marine' ? 'marine-supplies' : 'industrial-equipment';

  const { data, error } = await supabase
    .from('categories')
    .upsert(
      {
        name,
        slug,
        description: `${name} catalogue`,
        sort_order: division === 'marine' ? 1 : 2,
        division,
        parent_id: null,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

async function seedDivision(
  division: Division,
  catalogue: typeof MARINE_CATALOGUE,
  parentId: string,
) {
  let sortOrder = 0;
  const products: Record<string, unknown>[] = [];

  for (const entry of catalogue) {
    sortOrder += 1;
    const subSlug = `${division}-${slugify(entry.subcategory)}`;

    const { data: subcategory, error: catError } = await supabase
      .from('categories')
      .upsert(
        {
          name: entry.subcategory,
          slug: subSlug,
          description: `${entry.subcategory} — ${division === 'marine' ? 'Marine' : 'Industrial'}`,
          sort_order: sortOrder,
          division,
          parent_id: parentId,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();

    if (catError) throw catError;

    const categoryId = subcategory.id as string;
    const prefix = division === 'marine' ? 'MS' : 'IE';

    entry.products.forEach((productName, index) => {
      const baseSlug = slugify(`${division}-${entry.subcategory}-${productName}`);
      const sku = `${prefix}-${entry.letter}-${String(sortOrder).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`;

      products.push({
        sku,
        name: productName,
        slug: `${baseSlug}-${index + 1}`,
        description: `${productName} — professional grade ${entry.subcategory.toLowerCase()} for ${division === 'marine' ? 'marine' : 'industrial'} applications.`,
        category_id: categoryId,
        price: null,
        unit: 'each',
        in_stock: true,
        stock_quantity: 0,
        featured: index === 0,
        is_active: true,
        tags: [division, entry.letter.toLowerCase(), slugify(entry.subcategory)],
      });
    });
  }

  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'sku' });
    if (error) throw error;
    console.log(`  Upserted products ${i + 1}–${Math.min(i + batchSize, products.length)}`);
  }

  return products.length;
}

async function main() {
  console.log('Seeding Marine Supplies...');
  const marineParent = await upsertParent('marine');
  const marineCount = await seedDivision('marine', MARINE_CATALOGUE, marineParent);
  console.log(`Marine: ${marineCount} products`);

  console.log('Seeding Industrial Equipment...');
  const industrialParent = await upsertParent('industrial');
  const industrialCount = await seedDivision('industrial', INDUSTRIAL_CATALOGUE, industrialParent);
  console.log(`Industrial: ${industrialCount} products`);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
