import type { ReactNode } from 'react';
import { brandClasses } from '@/lib/brand';

type Section = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type Props = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: Section[];
  children?: ReactNode;
};

export function LegalDocument({ title, description, lastUpdated, sections }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className={brandClasses.eyebrow}>Joseph Bezzina & Co. Ltd</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#071B35] sm:text-4xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-[#071B35]">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
