/**
 * Local OMS smoke check — verifies migration 020 tables/columns exist.
 * Run: npx tsx scripts/verify-oms-local.ts
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

type Check = { name: string; ok: boolean; detail: string };

async function main() {
  loadEnvFile();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env vars in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const checks: Check[] = [];

  async function tableOk(name: string): Promise<boolean> {
    const { error } = await supabase.from(name).select('*').limit(1);
    return !error;
  }

  const tables = [
    'warehouses',
    'product_locations',
    'inventory_levels',
    'inventory_transactions',
    'order_status_history',
    'oms_report_snapshots',
  ];

  for (const table of tables) {
    const ok = await tableOk(table);
    checks.push({
      name: `table:${table}`,
      ok,
      detail: ok ? 'exists' : 'missing — run migration 020',
    });
  }

  const { data: orderSample, error: orderErr } = await supabase
    .from('orders')
    .select('id, oms_status, order_source, timeline')
    .limit(1);

  checks.push({
    name: 'orders.oms_columns',
    ok: !orderErr,
    detail: orderErr ? orderErr.message : 'oms_status, order_source, timeline readable',
  });

  if (orderSample?.[0]) {
    checks.push({
      name: 'orders.sample_oms_status',
      ok: true,
      detail: `sample oms_status=${orderSample[0].oms_status ?? 'null'}`,
    });
  }

  const { count: warehouseCount } = await supabase
    .from('warehouses')
    .select('*', { count: 'exact', head: true });

  checks.push({
    name: 'warehouses.seed',
    ok: (warehouseCount ?? 0) > 0,
    detail: `${warehouseCount ?? 0} warehouse(s)`,
  });

  const { data: roles } = await supabase.from('profiles').select('role');
  const roleSet = new Set((roles ?? []).map((r) => r.role));
  checks.push({
    name: 'profiles.roles',
    ok: true,
    detail: [...roleSet].join(', ') || 'no profiles',
  });

  console.log('\nOMS Local Verification\n');
  let failed = 0;
  for (const check of checks) {
    const icon = check.ok ? '✓' : '✗';
    if (!check.ok) failed += 1;
    console.log(`${icon} ${check.name}: ${check.detail}`);
  }

  console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
  if (failed > 0) {
    console.log('\nApply migration: supabase db push');
    console.log('Or run 020_oms_enterprise.sql in Supabase SQL Editor.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
