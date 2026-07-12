import { getAdminVacancies } from '@/actions/careers';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminCareersManager } from '@/components/admin/careers-manager';

export const metadata = { title: 'Vacancies | Admin' };

export default async function AdminCareersPage() {
  const result = await getAdminVacancies();
  const vacancies = result.success ? result.data ?? [] : [];

  return (
    <div>
      <AdminPageHeader
        title="Vacancies"
        description="Manage open positions shown on the public careers page."
      />
      {!result.success && <p className="mb-4 text-[var(--admin-danger)]">{result.error}</p>}
      <AdminCareersManager initialVacancies={vacancies} />
    </div>
  );
}
