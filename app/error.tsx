'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
        Error
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        We could not load this page. Please try again or contact our team if the
        problem continues.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
