'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
};

export function SignOutButton({
  className,
  children = 'Sign out',
  redirectTo = '/account/login',
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? 'Signing out…' : children}
    </button>
  );
}
