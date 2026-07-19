'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { requestPasswordReset } from '@/actions/auth';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import { RippleButton } from '@/components/ui/ripple-button';

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const isStaff = searchParams.get('audience') === 'staff';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? 'Enter a valid email address.');
      setLoading(false);
      return;
    }

    await requestPasswordReset(parsed.data.email);
    setMessage(
      'If an account exists for that email, a password reset link has been sent.',
    );
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        {isStaff ? 'Staff password reset' : 'Forgot password'}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {isStaff
          ? 'Enter your staff email and we will send a secure reset link. After resetting, sign in at the admin login.'
          : 'Enter your email and we will send you a secure reset link.'}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          autoComplete="email"
        />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <RippleButton type="submit">
          {loading ? 'Sending…' : 'Send reset link'}
        </RippleButton>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        <Link
          href={isStaff ? '/admin/login' : '/account/login'}
          className="font-medium text-[#0B3D91] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
