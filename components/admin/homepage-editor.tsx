'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHomepageSectionAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

type Section = {
  section_key: HomepageSectionKey;
  content: Record<string, unknown>;
  is_enabled: boolean;
};

type Props = { sections: Section[] };

export function HomepageEditor({ sections }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const hero = sections.find((s) => s.section_key === 'hero')?.content ?? {};

  function saveHero(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const content = {
      eyebrow: String(fd.get('eyebrow') ?? ''),
      subtitle: String(fd.get('subtitle') ?? ''),
      body: String(fd.get('body') ?? ''),
      heroImageUrl: String(fd.get('heroImageUrl') ?? ''),
      primaryButtonLabel: String(fd.get('primaryButtonLabel') ?? ''),
      primaryButtonHref: String(fd.get('primaryButtonHref') ?? ''),
      secondaryButtonLabel: String(fd.get('secondaryButtonLabel') ?? ''),
      secondaryButtonHref: String(fd.get('secondaryButtonHref') ?? ''),
    };
    setMessage('');
    startTransition(async () => {
      const result = await updateHomepageSectionAction('hero', content, true);
      setMessage(result.success ? 'Hero saved.' : result.error);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {message && <p className="text-sm text-green-700">{message}</p>}

      <form onSubmit={saveHero} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Hero Section</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Eyebrow</label>
            <input name="eyebrow" defaultValue={String(hero.eyebrow ?? '')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Subtitle</label>
            <input name="subtitle" defaultValue={String(hero.subtitle ?? '')} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">Body</label>
            <textarea name="body" rows={3} defaultValue={String(hero.body ?? '')} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">Hero Image URL</label>
            <input name="heroImageUrl" defaultValue={String(hero.heroImageUrl ?? '')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Primary Button</label>
            <input name="primaryButtonLabel" defaultValue={String(hero.primaryButtonLabel ?? '')} className={inputClass} />
            <input name="primaryButtonHref" defaultValue={String(hero.primaryButtonHref ?? '')} className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Secondary Button</label>
            <input name="secondaryButtonLabel" defaultValue={String(hero.secondaryButtonLabel ?? '')} className={inputClass} />
            <input name="secondaryButtonHref" defaultValue={String(hero.secondaryButtonHref ?? '')} className={`${inputClass} mt-2`} />
          </div>
        </div>
        <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
          Save Hero
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Other sections (About, Services, Why Choose Us, Contact, Footer) can be edited from Website Content.
      </p>
    </div>
  );
}
