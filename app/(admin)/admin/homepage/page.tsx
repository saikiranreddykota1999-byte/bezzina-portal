import { getHomepageSectionsAction } from '@/actions/admin-homepage';
import { HomepageEditor } from '@/components/admin/homepage-editor';
import type { HomepageSectionKey } from '@/types/cms';

export const metadata = { title: 'Homepage CMS | Admin' };

export default async function AdminHomepagePage() {
  const result = await getHomepageSectionsAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  const sections = (result.data ?? []).map((s) => ({
    section_key: s.section_key as HomepageSectionKey,
    content: (s.content as Record<string, unknown>) ?? {},
    is_enabled: s.is_enabled,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Homepage</h1>
      <p className="mt-1 text-sm text-slate-600">Edit hero, buttons, and homepage content without code.</p>
      <div className="mt-8">
        <HomepageEditor sections={sections} />
      </div>
    </div>
  );
}
