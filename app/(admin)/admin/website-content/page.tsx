import { guardAdminPage } from '@/lib/admin/guard-page';
import { WebsiteContentEditor } from '@/components/admin/website-content-editor';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { getHomepageSectionsAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';

export const metadata = { title: 'Website Content | Admin' };

export default async function AdminWebsiteContentPage() {
  await guardAdminPage('homepage:manage');
  const result = await getHomepageSectionsAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  const sections = (result.data ?? []).filter((s) =>
    ['about', 'services', 'why_choose', 'contact', 'footer'].includes(s.section_key),
  );

  return (
    <div>
      <AdminPageHeader
        title="Website Content"
        description="About, services, why choose us, contact, and footer sections."
      />
      <WebsiteContentEditor
        sections={sections.map((s) => ({
          section_key: s.section_key as HomepageSectionKey,
          content: (s.content as Record<string, unknown>) ?? {},
        }))}
      />
    </div>
  );
}
