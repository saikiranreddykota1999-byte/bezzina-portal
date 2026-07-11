import { getAdminJobPostings } from '@/actions/careers';
import { AdminCareersManager } from '@/components/admin/careers-manager';

export const metadata = { title: 'Careers | Admin' };

export default async function AdminCareersPage() {
  const result = await getAdminJobPostings();
  const jobs = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Careers</h1>
      {!result.success && <p className="mb-4 text-red-600">{result.error}</p>}
      <AdminCareersManager initialJobs={jobs} />
    </div>
  );
}
