/**
 * Set price = €1.00 on all products where price is null.
 * Run: npx tsx scripts/set-default-prices.ts
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_PRODUCT_PRICE } from '../lib/pricing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
for (const line of env.split('\n')) {
  const i = line.indexOf('=');
  if (i > 0) process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data: nullPrice, error: countErr } = await supabase
    .from('products')
    .select('id')
    .is('price', null);

  if (countErr) throw countErr;

  const { error } = await supabase
    .from('products')
    .update({ price: DEFAULT_PRODUCT_PRICE })
    .is('price', null);

  if (error) throw error;

  console.log(`✓ Set price to €${DEFAULT_PRODUCT_PRICE.toFixed(2)} on ${nullPrice?.length ?? 0} products`);

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('price', DEFAULT_PRODUCT_PRICE);

  console.log(`  Products at €${DEFAULT_PRODUCT_PRICE.toFixed(2)}: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
