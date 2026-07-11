import { getAdminVacancies } from '@/actions/careers';
import { AdminCareersManager } from '@/components/admin/careers-manager';

export const metadata = { title: 'Vacancies | Admin' };

export default async function AdminCareersPage() {
  const result = await getAdminVacancies();
  const vacancies = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Vacancies</h1>
      <p className="mb-6 text-sm text-slate-600">
        Manage open positions shown on the public careers page.
      </p>
      {!result.success && <p className="mb-4 text-red-600">{result.error}</p>}
      <AdminCareersManager initialVacancies={vacancies} />
    </div>
  );
}
