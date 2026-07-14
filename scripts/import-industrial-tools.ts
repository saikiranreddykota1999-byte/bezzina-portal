/**
 * Import industrial tools catalogue with variants into Supabase.
 * Run: npm run import:tools
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { importIndustrialToolsCatalogue } from '../services/product-import.service';

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

async function main() {
  loadEnvFile();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log('Importing industrial tools catalogue...');
  const summary = await importIndustrialToolsCatalogue(supabase);

  console.log('\nImport summary');
  console.log(`Categories: ${summary.categoriesCreated}`);
  console.log(`Products created: ${summary.productsCreated}`);
  console.log(`Products updated: ${summary.productsUpdated}`);
  console.log(`Variants created: ${summary.variantsCreated}`);
  console.log(`Skipped: ${summary.skipped}`);

  if (summary.errors.length > 0) {
    console.log('\nErrors:');
    summary.errors.forEach((error) => console.log(`- ${error}`));
  }

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`\nActive products in database: ${count ?? 'unknown'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
