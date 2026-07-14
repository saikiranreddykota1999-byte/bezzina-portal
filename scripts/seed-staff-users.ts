/**
 * One-time idempotent staff user provisioning for Joseph Bezzina portal.
 *
 * SECURITY:
 * - Passwords are read ONLY from environment variables (never from source code).
 * - Add credentials to `.env.local` (gitignored). Do not commit passwords.
 * - Uses Supabase service role locally; never bundle this script in the app.
 *
 * Run: npm run seed:staff
 */
import { createClient } from '@supabase/supabase-js';
import { loadLocalEnv } from './load-env';
import {
  STAFF_SEED_ACCOUNTS,
  buildStaffEmail,
  type StaffSeedRole,
} from '../lib/auth/staff-setup';

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseEmail = process.env.STAFF_BASE_EMAIL ?? 'saikiranreddy.kota1999@gmail.com';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedResult = {
  role: StaffSeedRole;
  email: string;
  userId: string;
  created: boolean;
  updated: boolean;
};

async function findUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function upsertStaffAccount(input: {
  role: StaffSeedRole;
  email: string;
  password: string;
  fullName: string;
}): Promise<SeedResult> {
  const email = input.email.toLowerCase();
  let created = false;
  let updated = false;
  let userId: string;

  const existing = await findUserByEmail(email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        portal_role: input.role,
        login_method: 'password',
      },
    });
    if (error) throw new Error(`${input.role}: ${error.message}`);
    userId = data.user.id;
    updated = true;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        portal_role: input.role,
        login_method: 'password',
      },
    });
    if (error || !data.user) {
      throw new Error(`${input.role}: ${error?.message ?? 'Failed to create user'}`);
    }
    userId = data.user.id;
    created = true;
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: userId,
      email,
      contact_email: email,
      full_name: input.fullName,
      role: input.role,
      is_disabled: false,
      force_password_change: true,
    },
    { onConflict: 'id' },
  );

  if (profileError) throw new Error(`${input.role}: ${profileError.message}`);

  return { role: input.role, email, userId, created, updated };
}

async function main() {
  const missingPasswords = STAFF_SEED_ACCOUNTS.filter(
    (account) => !process.env[account.passwordEnvKey]?.trim(),
  );

  if (missingPasswords.length > 0) {
    console.error('Missing staff passwords in .env.local (do not commit these values):');
    for (const account of missingPasswords) {
      console.error(`  - ${account.passwordEnvKey}`);
    }
    console.error('\nSee .env.example for the required variable names.');
    process.exit(1);
  }

  console.log('Provisioning staff accounts (idempotent)…');
  console.log(`Base email: ${baseEmail}`);
  console.log('Unique login emails use plus-address tags (+admin, +salesmanager, …)\n');

  const results: SeedResult[] = [];

  for (const account of STAFF_SEED_ACCOUNTS) {
    const email = buildStaffEmail(baseEmail, account.emailTag);
    const password = process.env[account.passwordEnvKey]!.trim();

    const result = await upsertStaffAccount({
      role: account.role,
      email,
      password,
      fullName: account.displayName,
    });
    results.push(result);

    const action = result.created ? 'created' : 'updated';
    console.log(`✓ ${account.role.padEnd(18)} ${action} → ${email}`);
  }

  console.log('\nStaff setup complete.');
  console.log('Passwords were loaded from environment variables only — not stored in source code.');
  console.log('Each account is flagged force_password_change=true for first-login password update.');
  console.log('\nLogin URLs:');
  console.log('  Admin portal: /admin/login');
  console.log('  Forced password change: /admin/change-password');
  console.log('\nAccounts:');
  for (const row of results) {
    console.log(`  ${row.role}: ${row.email}`);
  }
}

main().catch((error) => {
  console.error('Staff seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
