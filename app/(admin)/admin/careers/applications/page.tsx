import { guardAdminPage } from '@/lib/admin/guard-page';
import { getJobApplicationsAction } from '@/actions/admin-careers-applications';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CareerApplicationsManager } from '@/components/admin/career-applications-manager';

export const metadata = { title: 'Job Applications | Admin' };

export default async function AdminCareerApplicationsPage() {
  await guardAdminPage('careers:manage');
  const result = await getJobApplicationsAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Job Applications"
        description="Review CVs, cover letters, and LinkedIn profiles."
      />
      <CareerApplicationsManager applications={result.data ?? []} />
    </div>
  );
}
