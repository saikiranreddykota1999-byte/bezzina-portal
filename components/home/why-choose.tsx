import type { WhyChooseContent } from '@/types/cms';

const DEFAULT_REASONS = [
  {
    title: 'Family Business Since 1969',
    description:
      'A long-established Maltese supplier built on trusted service, continuity, and strong customer relationships.',
  },
  {
    title: 'Marine & Industrial Specialists',
    description:
      'Focused product knowledge across marine supplies, engineering materials, and industrial equipment.',
  },
  {
    title: 'Large Warehouse Stock',
    description:
      'Extensive stockholding helps customers source essential items quickly and reliably.',
  },
  {
    title: 'Trusted by Trade Professionals',
    description:
      'Preferred by workshops, contractors, marine operators, and technical buyers across Malta.',
  },
  {
    title: 'Technical Product Knowledge',
    description:
      'Practical guidance to help customers select the right products for the job.',
  },
  {
    title: 'Fast Quote Response',
    description:
      'Responsive support for enquiries, quotations, and urgent supply requirements.',
  },
];

function FeatureIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#0B3D91]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 12 1.75 1.75L15 10" />
    </svg>
  );
}

type Props = { content?: Partial<WhyChooseContent> };

export function WhyChoose({ content }: Props) {
  const reasons = content?.items?.length ? content.items : DEFAULT_REASONS;

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="why-choose-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
            {content?.eyebrow ?? 'Why Choose Us'}
          </p>
          <h2
            id="why-choose-title"
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            {content?.title ?? 'Dependable supply backed by experience and technical service'}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {content?.description ??
              'Joseph Bezzina & Co. Ltd supports marine and industrial customers with practical expertise, trusted stock, and responsive service.'}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFF9]">
                <FeatureIcon />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{reason.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
