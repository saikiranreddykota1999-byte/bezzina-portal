import { WebsiteContentEditor } from '@/components/admin/website-content-editor';
import { getHomepageSectionsAction } from '@/actions/admin-homepage';
import type { HomepageSectionKey } from '@/types/cms';

export const metadata = { title: 'Website Content | Admin' };

export default async function AdminWebsiteContentPage() {
  const result = await getHomepageSectionsAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  const sections = (result.data ?? []).filter((s) =>
    ['about', 'services', 'why_choose', 'contact', 'footer'].includes(s.section_key),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Website Content</h1>
      <p className="mt-1 text-sm text-slate-600">About, services, why choose us, contact, and footer sections.</p>
      <div className="mt-8">
        <WebsiteContentEditor
          sections={sections.map((s) => ({
            section_key: s.section_key as HomepageSectionKey,
            content: (s.content as Record<string, unknown>) ?? {},
          }))}
        />
      </div>
    </div>
  );
}
