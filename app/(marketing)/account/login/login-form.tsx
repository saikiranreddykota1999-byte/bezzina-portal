'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sendEmailOtpAction, verifyEmailOtpAction } from '@/actions/email-otp';
import { sendPhoneOtpAction, verifyPhoneOtpAction } from '@/actions/phone-otp';
import { loginSchema } from '@/lib/validators/auth';
import { RippleButton } from '@/components/ui/ripple-button';

const inputClassName =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

type AuthMode = 'email-otp' | 'phone-otp' | 'password';

type LoginFormProps = {
  redirectPath: string;
  initialMode?: AuthMode;
  authCallbackError?: string;
};

export default function LoginForm({
  redirectPath,
  initialMode = 'email-otp',
  authCallbackError,
}: LoginFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(authCallbackError ?? '');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function resetOtpState() {
    setOtpSent(false);
    setOtp('');
    setDemoCode('');
    setError('');
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    resetOtpState();
    setError('');
    setFieldErrors({});
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
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

    router.push(redirectPath);
    router.refresh();
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setLoading(true);
    setError('');
    const origin = window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
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
    setDemoCode('');

    const result =
      mode === 'email-otp'
        ? await sendEmailOtpAction({ email })
        : await sendPhoneOtpAction({ phone });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOtpSent(true);
    if (result.data?.demoCode) {
      setDemoCode(result.data.demoCode);
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result =
      mode === 'email-otp'
        ? await verifyEmailOtpAction({ email, code: otp })
        : await verifyPhoneOtpAction({ phone, code: otp });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Sign in or create your account with a 6-digit code sent to your email or phone.
      </p>

      <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => switchMode('email-otp')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'email-otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Mail OTP
        </button>
        <button
          type="button"
          onClick={() => switchMode('phone-otp')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'phone-otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Phone OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4" noValidate>
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
          <button
            type="button"
            onClick={() => switchMode('email-otp')}
            className="text-sm text-orange-600 hover:underline"
          >
            Use OTP instead
          </button>
        </form>
      ) : (
        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="mt-6 space-y-4"
          noValidate
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            We send a <strong>6-digit code</strong> to your{' '}
            {mode === 'email-otp' ? 'email' : 'phone'}. Enter it below to sign in or create your
            account automatically.
          </div>

          {mode === 'email-otp' ? (
            <div>
              <label htmlFor="login-email-otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                Mail ID
              </label>
              <input
                id="login-email-otp"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                placeholder="you@company.com"
                className={inputClassName}
              />
            </div>
          ) : (
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
                placeholder="+356 7757 6721"
                className={inputClassName}
              />
            </div>
          )}

          {otpSent && (
            <div>
              <label htmlFor="login-otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                6-digit code
              </label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className={`${inputClassName} text-center text-lg tracking-[0.3em]`}
              />
              {demoCode && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Delivery not configured (dev mode). Your code:{' '}
                  <span className="font-mono font-bold">{demoCode}</span>
                </p>
              )}
              <button
                type="button"
                onClick={resetOtpState}
                className="mt-2 text-sm text-orange-600 hover:underline"
              >
                {mode === 'email-otp' ? 'Use a different email' : 'Use a different number'}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <RippleButton type="submit" className="w-full" variant="primary">
            {loading ? 'Please wait…' : otpSent ? 'Verify & Sign In' : 'Send 6-digit code'}
          </RippleButton>
        </form>
      )}

      {mode !== 'password' && (
        <p className="mt-4 text-center text-sm text-slate-600">
          Have a password?{' '}
          <button
            type="button"
            onClick={() => switchMode('password')}
            className="font-medium text-orange-600 hover:underline"
          >
            Sign in with password
          </button>
        </p>
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
        New customer? Use <strong>Mail OTP</strong> or <strong>Phone OTP</strong> above — your account
        is created automatically when you verify the code.
      </p>
    </div>
  );
}
