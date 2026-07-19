/**
 * Create or update a demo customer with email + password login.
 * Run: npx tsx scripts/seed-demo-customer.ts
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

loadEnvFile();

const DEMO_EMAIL = process.env.DEMO_CUSTOMER_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_CUSTOMER_PASSWORD;
const DEMO_NAME = process.env.DEMO_CUSTOMER_NAME ?? 'Demo Customer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!DEMO_EMAIL || !DEMO_PASSWORD) {
  console.error(
    'Set DEMO_CUSTOMER_EMAIL and DEMO_CUSTOMER_PASSWORD in .env.local (do not commit these values).',
  );
  process.exit(1);
}

const demoEmail = DEMO_EMAIL;
const demoPassword = DEMO_PASSWORD;

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function main() {
  const email = demoEmail.toLowerCase();
  let userId: string;

  const existing = await findUserByEmail(email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME, login_method: 'password' },
    });
    if (error) throw new Error(error.message);
    userId = data.user.id;
    console.log('Updated existing auth user:', email);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME, login_method: 'password' },
    });
    if (error || !data.user) throw new Error(error?.message ?? 'Failed to create user');
    userId = data.user.id;
    console.log('Created auth user:', email);
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email,
    contact_email: email,
    full_name: DEMO_NAME,
    role: 'customer',
    is_disabled: false,
  });

  if (profileError) throw new Error(profileError.message);

  console.log('\nDemo customer ready.');
  console.log('  Email:   ', email);
  console.log('  Password:', DEMO_PASSWORD);
  console.log('  Login:   /account/login → choose "Password" tab');
  console.log('  User ID: ', userId);
}

main().catch((error) => {
  console.error('Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
