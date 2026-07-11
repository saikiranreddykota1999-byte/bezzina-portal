'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import { loginSchema } from '@/lib/validators/auth';
import { RippleButton } from '@/components/ui/ripple-button';

const inputClassName =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

type AuthMode = 'email' | 'phone';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get('redirect'));
  const [mode, setMode] = useState<AuthMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setLoading(true);
    setError('');
    const origin = window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!phone.trim()) {
      setError('Enter your phone number with country code (e.g. +356...)');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Access your account, quote history, and orders.
      </p>

      <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('email')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Phone OTP
        </button>
      </div>

      {mode === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <RippleButton type="submit" className="w-full" variant="primary">
            {loading ? 'Signing in…' : 'Sign In'}
          </RippleButton>
        </form>
      ) : (
        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="mt-6 space-y-4"
          noValidate
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            WhatsApp is not a standard OAuth provider. Phone OTP via SMS is used instead.
            See <code className="text-amber-800">docs/CLIENT-CONFIRMATIONS.md</code> for details.
          </div>
          <div>
            <label htmlFor="login-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              id="login-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={otpSent}
              placeholder="+356 9912 3456"
              className={inputClassName}
            />
          </div>
          {otpSent && (
            <div>
              <label htmlFor="login-otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className={inputClassName}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <RippleButton type="submit" className="w-full" variant="primary">
            {loading ? 'Please wait…' : otpSent ? 'Verify & Sign In' : 'Send OTP'}
          </RippleButton>
        </form>
      )}

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-600">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuth('google')}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Google
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuth('facebook')}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Facebook
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{' '}
        <Link href="/account/register" className="font-medium text-orange-600 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
