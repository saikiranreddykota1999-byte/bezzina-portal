'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { changePasswordSchema } from '@/lib/validators/auth';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { RippleButton } from '@/components/ui/ripple-button';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const parsed = changePasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? 'Password does not meet requirements.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setMessage(
      error ? 'Unable to update password. Please try again.' : 'Password updated successfully.',
    );
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={password} />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <RippleButton type="submit">
          {loading ? 'Updating…' : 'Update Password'}
        </RippleButton>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        <Link href="/account/forgot-password" className="font-medium text-[#0B3D91] hover:underline">
          Forgot your password?
        </Link>
      </p>
    </div>
  );
}
