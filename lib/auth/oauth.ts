import type { SupabaseClient } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'facebook';

export async function startCustomerOAuth(
  supabase: SupabaseClient,
  provider: OAuthProvider,
  redirectPath: string,
): Promise<{ error?: string }> {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    window.location.assign(data.url);
  }

  return {};
}
