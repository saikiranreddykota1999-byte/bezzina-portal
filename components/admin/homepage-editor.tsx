'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHomepageSectionAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminLabelClass,
  adminSubtextClass,
  adminTextareaClass,
} from '@/components/admin/admin-styles';

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
      {message && <p className="text-sm text-[var(--admin-success)]">{message}</p>}

      <form onSubmit={saveHero} className={`${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Hero Section</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`mb-1 block ${adminLabelClass}`}>Eyebrow</label>
            <input name="eyebrow" defaultValue={String(hero.eyebrow ?? '')} className={adminInputClass} />
          </div>
          <div>
            <label className={`mb-1 block ${adminLabelClass}`}>Subtitle</label>
            <input name="subtitle" defaultValue={String(hero.subtitle ?? '')} className={adminInputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={`mb-1 block ${adminLabelClass}`}>Body</label>
            <textarea name="body" rows={3} defaultValue={String(hero.body ?? '')} className={adminTextareaClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={`mb-1 block ${adminLabelClass}`}>Hero Image URL</label>
            <input name="heroImageUrl" defaultValue={String(hero.heroImageUrl ?? '')} className={adminInputClass} />
          </div>
          <div>
            <label className={`mb-1 block ${adminLabelClass}`}>Primary Button</label>
            <input name="primaryButtonLabel" defaultValue={String(hero.primaryButtonLabel ?? '')} className={adminInputClass} />
            <input name="primaryButtonHref" defaultValue={String(hero.primaryButtonHref ?? '')} className={`${adminInputClass} mt-2`} />
          </div>
          <div>
            <label className={`mb-1 block ${adminLabelClass}`}>Secondary Button</label>
            <input name="secondaryButtonLabel" defaultValue={String(hero.secondaryButtonLabel ?? '')} className={adminInputClass} />
            <input name="secondaryButtonHref" defaultValue={String(hero.secondaryButtonHref ?? '')} className={`${adminInputClass} mt-2`} />
          </div>
        </div>
        <button type="submit" disabled={pending} className={`mt-4 ${adminButtonPrimaryClass}`}>
          Save Hero
        </button>
      </form>

      <p className={adminSubtextClass}>
        Other sections (About, Services, Why Choose Us, Contact, Footer) can be edited from Website Content.
      </p>
    </div>
  );
}
