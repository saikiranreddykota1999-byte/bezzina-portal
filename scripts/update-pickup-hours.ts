/**
 * Apply Mon–Fri 7:00 AM – 4:00 PM pickup hours to all branches.
 * Run: npx tsx scripts/update-pickup-hours.ts
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_PICKUP_TIME_SLOTS,
  PICKUP_CLOSES_AT,
  PICKUP_OPENS_AT,
} from '../lib/pickup/defaults';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: locations, error: locationError } = await admin
    .from('pickup_locations')
    .select('id, name');

  if (locationError) throw new Error(locationError.message);
  if (!locations?.length) {
    console.log('No pickup locations found.');
    return;
  }

  for (const location of locations) {
    const { error: hoursError } = await admin.from('pickup_opening_hours').upsert(
      [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        location_id: location.id,
        day_of_week: day,
        opens_at: PICKUP_OPENS_AT,
        closes_at: PICKUP_CLOSES_AT,
        is_closed: day === 0 || day === 6,
      })),
      { onConflict: 'location_id,day_of_week' },
    );

    if (hoursError) throw new Error(hoursError.message);

    await admin
      .from('pickup_time_slots')
      .update({ is_active: false })
      .eq('location_id', location.id)
      .gte('slot_time', '16:00:00');

    const { error: slotError } = await admin.from('pickup_time_slots').upsert(
      DEFAULT_PICKUP_TIME_SLOTS.map((slot) => ({
        location_id: location.id,
        ...slot,
        is_active: true,
      })),
      { onConflict: 'location_id,slot_time' },
    );

    if (slotError) throw new Error(slotError.message);

    console.log(`Updated pickup hours for: ${location.name}`);
  }

  console.log('\nPickup hours set to Monday–Friday, 7:00 AM – 4:00 PM.');
  console.log('Time slots:', DEFAULT_PICKUP_TIME_SLOTS.map((slot) => slot.label).join(', '));
}

main().catch((error) => {
  console.error('Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
