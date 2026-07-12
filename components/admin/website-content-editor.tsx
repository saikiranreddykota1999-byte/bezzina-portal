'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHomepageSectionAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

type Section = {
  section_key: HomepageSectionKey;
  content: Record<string, unknown>;
};

type Props = { sections: Section[] };

export function WebsiteContentEditor({ sections }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function saveSection(sectionKey: HomepageSectionKey, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const content = Object.fromEntries(fd.entries());
    startTransition(async () => {
      await updateHomepageSectionAction(sectionKey, content, true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <form
          key={section.section_key}
          onSubmit={(e) => saveSection(section.section_key, e)}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="font-semibold capitalize">{section.section_key.replace('_', ' ')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
              <input name="title" defaultValue={String(section.content.title ?? '')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Body / Content</label>
              <textarea name="body" rows={4} defaultValue={String(section.content.body ?? '')} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
            Save {section.section_key.replace('_', ' ')}
          </button>
        </form>
      ))}
    </div>
  );
}
