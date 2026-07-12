import Link from 'next/link';
import type { CtaContent } from '@/types/cms';

type Props = { content?: Partial<CtaContent> };

export function CTA({ content }: Props) {
  return (
    <section
      className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 py-16 text-white sm:py-20"
      aria-labelledby="cta-title"
    >
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 id="cta-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {content?.title ?? 'Need Industrial or Marine Supplies?'}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          {content?.description ??
            'Contact our experienced team for fast quotations and technical assistance.'}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={content?.primaryHref ?? '/quote'}
            className="inline-flex items-center justify-center rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {content?.primaryLabel ?? 'Request a Quote'}
          </Link>
          <Link
            href={content?.secondaryHref ?? '/contact'}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {content?.secondaryLabel ?? 'Contact Us'}
          </Link>
        </div>
      </div>
    </section>
  );
}
