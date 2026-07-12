'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sendEmailOtpAction, verifyEmailOtpAction } from '@/actions/email-otp';
import { sendPhoneOtpAction, verifyPhoneOtpAction } from '@/actions/phone-otp';
import type { CustomerAuthConfigStatus } from '@/actions/customer-auth-status';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { loginSchema } from '@/lib/validators/auth';
import { RippleButton } from '@/components/ui/ripple-button';

const inputClassName =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

type AuthMode = 'email-otp' | 'phone-otp' | 'password';

type LoginFormProps = {
  redirectPath: string;
  initialMode?: AuthMode;
  authCallbackError?: string;
  authConfig: CustomerAuthConfigStatus;
};

export default function LoginForm({
  redirectPath,
  initialMode = 'email-otp',
  authCallbackError,
  authConfig,
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

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!authConfig.adminConfigured || !authConfig.otpTablesReady) {
      setError(authConfig.adminError ?? 'Login is not configured yet.');
      return;
    }

    const deliveryReady =
      mode === 'email-otp' ? authConfig.emailDeliveryConfigured : authConfig.smsDeliveryConfigured;

    if (!authConfig.isDevelopment && !deliveryReady) {
      setError(
        mode === 'email-otp'
          ? 'Email OTP is not configured on this server. Add RESEND_API_KEY in Vercel, redeploy, or use Sign in with password.'
          : 'Phone OTP is not configured on this server. Add Twilio variables in Vercel, redeploy, or use Sign in with password.',
      );
      return;
    }

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

      {!authConfig.adminConfigured && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p className="font-semibold">Login backend is not configured</p>
          <p className="mt-1">{authConfig.adminError}</p>
          <p className="mt-2 text-xs text-red-700">
            After updating <code className="font-mono">.env.local</code>, stop and restart{' '}
            <code className="font-mono">npm run dev</code>.
          </p>
        </div>
      )}

      {authConfig.adminConfigured && authConfig.demoMode && authConfig.isDevelopment && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          Dev mode: email/SMS delivery is not configured. After you click &quot;Send 6-digit code&quot;, the
          code will appear on this page.
        </div>
      )}

      {authConfig.adminConfigured &&
        authConfig.demoMode &&
        !authConfig.isDevelopment &&
        authConfig.otpTablesReady && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <p className="font-semibold">OTP delivery is not configured on this server</p>
          <p className="mt-1">
            Add <code className="font-mono">RESEND_API_KEY</code> for Mail OTP or Twilio variables for Phone OTP
            in your hosting environment, then redeploy. Until then, use{' '}
            <button type="button" onClick={() => switchMode('password')} className="font-medium text-orange-700 underline">
              Sign in with password
            </button>
            .
          </p>
        </div>
      )}

      {authConfig.adminConfigured && !authConfig.otpTablesReady && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p className="font-semibold">OTP database tables are missing</p>
          <p className="mt-1">{authConfig.otpTablesError}</p>
          <p className="mt-2 text-xs text-red-700">
            Run migrations <code className="font-mono">006_phone_otp.sql</code> and{' '}
            <code className="font-mono">011_email_otp.sql</code> in the Supabase SQL Editor.
          </p>
        </div>
      )}

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
          <RippleButton
            type="submit"
            className={`w-full ${!authConfig.adminConfigured || !authConfig.otpTablesReady ? 'pointer-events-none opacity-50' : ''}`}
            variant="primary"
          >
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

      <SocialAuthButtons redirectPath={redirectPath} disabled={loading} />

      <p className="mt-6 text-center text-sm text-slate-600">
        New customer? Use <strong>Mail OTP</strong>, <strong>Phone OTP</strong>, or{' '}
        <strong>Google / Facebook</strong> above — your account is created automatically.
      </p>
    </div>
  );
}
