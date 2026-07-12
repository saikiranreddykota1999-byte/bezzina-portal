import { getActivityLogs } from '@/actions/admin-activity-log';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ActivityLogTable } from '@/components/admin/activity-log-table';

export const metadata = { title: 'Activity Logs | Admin' };

export default async function ActivityLogsPage() {
  const result = await getActivityLogs(100);
  const logs = result.success ? result.data ?? [] : [];

  return (
    <div>
      <AdminPageHeader
        title="Activity Log"
        description="Audit trail of admin actions — who, when, IP, device, and value changes."
      />
      <ActivityLogTable logs={logs} />
    </div>
  );
}
