'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHomepageSectionAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
} from '@/components/admin/admin-styles';

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
          className={`${adminCardClass} p-6`}
        >
          <h2 className={`${adminHeadingClass} capitalize`}>{section.section_key.replace('_', ' ')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Title</label>
              <input name="title" defaultValue={String(section.content.title ?? '')} className={adminInputClass} />
            </div>
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Body / Content</label>
              <textarea name="body" rows={4} defaultValue={String(section.content.body ?? '')} className={adminTextareaClass} />
            </div>
          </div>
          <button type="submit" disabled={pending} className={`mt-4 ${adminButtonPrimaryClass}`}>
            Save {section.section_key.replace('_', ' ')}
          </button>
        </form>
      ))}
    </div>
  );
}
