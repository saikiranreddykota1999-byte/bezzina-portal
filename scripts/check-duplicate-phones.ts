/**
 * One-off: report duplicate normalized phones on profiles before unique index.
 * Usage: npx tsx scripts/check-duplicate-phones.ts
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { normalizePhone } from '../lib/otp/phone-helpers';

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2] ?? '';
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) {
      process.env[match[1]] = value;
    }
  }
}

loadEnv('.env.local');
loadEnv('.env');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('MISSING_SUPABASE_CREDS');
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await admin
    .from('profiles')
    .select('id, phone')
    .not('phone', 'is', null);

  if (error) {
    console.error('QUERY_ERROR', error.message);
    process.exit(1);
  }

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const normalized = normalizePhone(String(row.phone ?? ''));
    if (!normalized) {
      console.log('UNPARSEABLE', row.id, JSON.stringify(row.phone));
      continue;
    }
    const list = map.get(normalized) ?? [];
    list.push(row.id);
    map.set(normalized, list);
  }

  const dupes = [...map.entries()].filter(([, ids]) => ids.length > 1);
  console.log('TOTAL_WITH_PHONE', (data ?? []).length);
  console.log('UNIQUE_NORMALIZED', map.size);
  console.log('DUPLICATE_GROUPS', dupes.length);
  for (const [phone, ids] of dupes) {
    console.log('DUPE', phone, 'COUNT', ids.length, 'IDS', ids.join(','));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
