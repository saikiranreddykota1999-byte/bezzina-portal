import { getHomepageSectionsAction } from '@/actions/admin-homepage';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { HomepageEditor } from '@/components/admin/homepage-editor';
import type { HomepageSectionKey } from '@/types/cms';

export const metadata = { title: 'Homepage CMS | Admin' };

export default async function AdminHomepagePage() {
  const result = await getHomepageSectionsAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  const sections = (result.data ?? []).map((s) => ({
    section_key: s.section_key as HomepageSectionKey,
    content: (s.content as Record<string, unknown>) ?? {},
    is_enabled: s.is_enabled,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Edit hero, buttons, and homepage content without code."
      />
      <HomepageEditor sections={sections} />
    </div>
  );
}
