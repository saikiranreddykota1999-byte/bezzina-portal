import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAllSiteSettingsForAdmin } from '@/actions/admin-settings';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SettingsManager } from '@/components/admin/settings-manager';

export const metadata = { title: 'Settings | Admin' };

export default async function AdminSettingsPage() {
  await guardAdminPage('settings:manage');
  const result = await getAllSiteSettingsForAdmin();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  const byKey = Object.fromEntries(result.data.map((row) => [row.key, row.value as Record<string, unknown>]));

  return (
    <div>
      <AdminPageHeader
        title="Website Settings"
        description="Company info, social links, and business hours."
      />
      <SettingsManager
        company={byKey.company ?? {}}
        social={byKey.social ?? {}}
        businessHours={byKey.business_hours ?? {}}
      />
    </div>
  );
}
