/**
 * Seed 20 categories × 20 products = 400 sample products
 * Run: npx tsx scripts/seed-catalog.ts
 */
import { createClient } from '@supabase/supabase-js';
import { PRODUCT_CATEGORIES, SAMPLE_BRANDS } from '../config/categories';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const PRODUCT_TYPES = ['Pro', 'Standard', 'Heavy-Duty', 'Marine Grade', 'Industrial', 'Compact'];
const MATERIALS = ['Stainless Steel', 'Carbon Steel', 'Brass', 'Aluminium', 'Composite', 'Rubber'];
const STANDARDS = ['ISO', 'DIN', 'ANSI', 'BS', 'JIS', null];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedBrands() {
  const rows = SAMPLE_BRANDS.map((name) => ({
    name,
    slug: slugify(name),
    logo_url: null,
  }));

  const { data, error } = await supabase
    .from('brands')
    .upsert(rows, { onConflict: 'slug' })
    .select();

  if (error) throw error;
  return data ?? [];
}

async function seedCategories() {
  const rows = PRODUCT_CATEGORIES.map((cat, i) => ({
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    sort_order: i + 1,
  }));

  const { data, error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'slug' })
    .select();

  if (error) throw error;
  return data ?? [];
}

async function seedProducts(
  categories: { id: string; name: string; slug: string }[],
  brands: { id: string; name: string }[],
) {
  const products = [];

  for (const category of categories) {
    for (let i = 1; i <= 20; i++) {
      const type = PRODUCT_TYPES[i % PRODUCT_TYPES.length];
      const brand = brands[i % brands.length];
      const material = MATERIALS[i % MATERIALS.length];
      const standard = STANDARDS[i % STANDARDS.length];
      const name = `${category.name} ${type} Model ${String(i).padStart(2, '0')}`;
      const slug = `${category.slug}-${slugify(type)}-${i}`;
      const sku = `JB-${category.slug.slice(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`;

      products.push({
        sku,
        name,
        slug,
        description: `Sample ${name} for ${category.name}. Professional grade equipment suitable for marine and industrial applications.`,
        category_id: category.id,
        brand_id: brand.id,
        image_url: null,
        material,
        standard,
        thread_type: category.slug === 'fasteners' ? `M${6 + (i % 12)}` : null,
        length_mm: category.slug === 'fasteners' ? 20 + i * 5 : null,
        diameter_mm: category.slug === 'fasteners' ? 6 + (i % 12) : null,
        grade: i % 3 === 0 ? '8.8' : null,
        price: null,
        unit: 'each',
        in_stock: i % 5 !== 0,
        stock_quantity: i % 5 !== 0 ? 10 + i * 3 : 0,
        featured: i <= 2,
        fast_selling: i % 4 === 0,
        upcoming: i % 10 === 0,
        future_product: i % 15 === 0,
        discount_percent: i % 7 === 0 ? 10 : null,
        is_active: true,
        tags: [category.slug, brand.name.toLowerCase()],
        seo_title: `${name} | Joseph Bezzina & Co Ltd`,
        seo_description: `Buy ${name} from Joseph Bezzina & Co Ltd, Malta.`,
      });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < products.length; i += 50) {
    const batch = products.slice(i, i + 50);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'slug' });
    if (error) throw error;
    console.log(`Inserted products ${i + 1}–${Math.min(i + 50, products.length)}`);
  }

  console.log(`Total products seeded: ${products.length}`);
}

async function main() {
  console.log('Seeding brands...');
  const brands = await seedBrands();
  console.log(`Brands: ${brands.length}`);

  console.log('Seeding categories...');
  const categories = await seedCategories();
  console.log(`Categories: ${categories.length}`);

  console.log('Seeding products (400)...');
  await seedProducts(categories, brands);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
