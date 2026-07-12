import { getActivityLogs } from '@/actions/admin-activity-log';
import { ActivityLogTable } from '@/components/admin/activity-log-table';

export const metadata = { title: 'Activity Logs | Admin' };

export default async function ActivityLogsPage() {
  const result = await getActivityLogs(100);
  const logs = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Activity Log</h1>
      <p className="mb-6 text-sm text-slate-600">
        Audit trail of admin actions — who, when, IP, device, and value changes.
      </p>
      <ActivityLogTable logs={logs} />
    </div>
  );
}
