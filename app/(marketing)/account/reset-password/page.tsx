'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { changePasswordSchema } from '@/lib/validators/auth';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { RippleButton } from '@/components/ui/ripple-button';

export default function ResetPasswordPage() {
  const router = useRouter();
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
    if (error) {
      setMessage('Unable to reset password. Request a new link and try again.');
      setLoading(false);
      return;
    }

    setMessage('Password updated. Redirecting to login…');
    await supabase.auth.signOut();
    setTimeout(() => router.push('/account/login'), 1500);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
      <p className="mt-2 text-sm text-slate-600">Choose a strong new password for your account.</p>
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
          {loading ? 'Updating…' : 'Update password'}
        </RippleButton>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        <Link href="/account/login" className="font-medium text-[#0B3D91] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
