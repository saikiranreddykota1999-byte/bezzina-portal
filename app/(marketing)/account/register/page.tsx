import Link from 'next/link';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { RippleButton } from '@/components/ui/ripple-button';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose a sign-up method below. Your customer account is created automatically — no forms to
        fill in.
      </p>

      <div className="mt-8">
        <SocialAuthButtons redirectPath="/account" />
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-600">Or use OTP</span>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p>
          <strong>Mail OTP:</strong> enter your email on the login page, verify the 6-digit code, and
          your account is ready.
        </p>
        <p>
          <strong>Phone OTP:</strong> enter your mobile number, verify the SMS code, and your account
          is ready.
        </p>
      </div>

      <Link href="/account/login" className="mt-6 block">
        <RippleButton className="w-full">Continue with Mail or Phone OTP</RippleButton>
      </Link>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/account/login" className="font-medium text-orange-800 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
