import { getSeoPagesAction } from '@/actions/admin-seo';
import { SeoManager } from '@/components/admin/seo-manager';

export const metadata = { title: 'SEO Manager | Admin' };

export default async function AdminSeoPage() {
  const result = await getSeoPagesAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">SEO Manager</h1>
      <p className="mt-1 text-sm text-slate-600">Page titles, meta descriptions, keywords, and robots settings.</p>
      <div className="mt-8">
        <SeoManager pages={result.data ?? []} />
      </div>
    </div>
  );
}
