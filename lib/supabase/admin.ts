import { createClient } from '@supabase/supabase-js';

export function getAdminClientConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean);

    return (
      `Supabase admin credentials are not configured (missing: ${missing.join(', ')}). ` +
      'Add them to .env.local and restart the dev server, or set them in your deployment environment (e.g. Vercel) and redeploy.'
    );
  }

  return null;
}

export function createAdminClient() {
  const configError = getAdminClientConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
