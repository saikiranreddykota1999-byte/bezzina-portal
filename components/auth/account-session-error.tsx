'use client';

import Link from 'next/link';
import { RippleButton } from '@/components/ui/ripple-button';

type Props = {
  message: string;
};

export function AccountSessionError({ message }: Props) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center"
      role="alert"
    >
      <p className="text-sm font-medium text-red-900">Unable to verify your session</p>
      <p className="mt-2 text-sm text-red-800">{message}</p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <RippleButton href="/account">Try again</RippleButton>
        <Link
          href="/account/login?redirect=/account"
          className="text-sm font-medium text-orange-800 hover:underline"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
