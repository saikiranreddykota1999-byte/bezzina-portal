import Link from 'next/link';
import type { ReactNode } from 'react';
import { brandClasses } from '@/lib/brand';

type ContentPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className={brandClasses.eyebrow}>Joseph Bezzina & Co. Ltd</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#071B35] sm:text-4xl">
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
      <Link href="/quote" className={brandClasses.btnPrimary}>
        Ask for quote
      </Link>
      <Link href="/contact" className={brandClasses.btnSecondary}>
        Contact Us
      </Link>
    </div>
  );
}
