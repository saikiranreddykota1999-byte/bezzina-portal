import { getJobApplicationsAction } from '@/actions/admin-careers-applications';
import { CareerApplicationsManager } from '@/components/admin/career-applications-manager';

export const metadata = { title: 'Job Applications | Admin' };

export default async function AdminCareerApplicationsPage() {
  const result = await getJobApplicationsAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Job Applications</h1>
      <p className="mt-1 text-sm text-slate-600">Review CVs, cover letters, and LinkedIn profiles.</p>
      <div className="mt-8">
        <CareerApplicationsManager applications={result.data ?? []} />
      </div>
    </div>
  );
}
