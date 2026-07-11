'use client';

import Link from 'next/link';
import { RippleButton } from '@/components/ui/ripple-button';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-2 text-sm text-slate-600">
        No separate registration is needed. Use your email or phone number on the login page and
        we will create your customer account when you verify the 6-digit code.
      </p>

      <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p>
          <strong>Mail OTP:</strong> enter your email, receive a code, verify, and your account is
          ready.
        </p>
        <p>
          <strong>Phone OTP:</strong> enter your mobile number, receive SMS code, verify, and your
          account is ready.
        </p>
      </div>

      <Link href="/account/login" className="mt-6 block">
        <RippleButton className="w-full">Continue to Login</RippleButton>
      </Link>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/account/login" className="font-medium text-orange-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
