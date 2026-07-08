import Link from 'next/link';
import type { ReactNode } from 'react';

type ContentPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        Joseph Bezzina & Co. Ltd
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </main>
  );
}

export function ContentPageActions() {
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
      <Link
        href="/quote"
        className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Request a Quote
      </Link>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
      >
        Contact Us
      </Link>
    </div>
  );
}
