import { getAllSiteSettingsForAdmin } from '@/actions/admin-settings';
import { SettingsManager } from '@/components/admin/settings-manager';

export const metadata = { title: 'Settings | Admin' };

export default async function AdminSettingsPage() {
  const result = await getAllSiteSettingsForAdmin();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  const byKey = Object.fromEntries(result.data.map((row) => [row.key, row.value as Record<string, unknown>]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Website Settings</h1>
      <p className="mt-1 text-sm text-slate-600">Company info, social links, and business hours.</p>
      <div className="mt-8">
        <SettingsManager
          company={byKey.company ?? {}}
          social={byKey.social ?? {}}
          businessHours={byKey.business_hours ?? {}}
        />
      </div>
    </div>
  );
}
