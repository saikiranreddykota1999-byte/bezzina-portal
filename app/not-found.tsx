import Link from 'next/link';
import { company } from '@/config/company';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        The page you are looking for may have moved or no longer exists. Browse our
        catalogue or request a quotation for marine and industrial supplies.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          Browse Products
        </Link>
        <Link
          href="/quote"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          Request a Quote
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-500">
        Need help?{' '}
        <Link href="/contact" className="font-medium text-[#0B3D91] hover:underline">
          Contact {company.shortName}
        </Link>
      </p>
    </main>
  );
}
