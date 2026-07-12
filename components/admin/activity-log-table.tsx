import type { ActivityLog } from '@/types/admin';
import { adminEmptyStateClass, adminTableClass, adminTableWrapClass } from '@/components/admin/admin-styles';

type Props = { logs: ActivityLog[] };

export function ActivityLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return <div className={adminEmptyStateClass}>No activity recorded yet.</div>;
  }

  return (
    <div className={adminTableWrapClass}>
      <table className={adminTableClass}>
        <thead>
          <tr>
            <th>When</th>
            <th>Who</th>
            <th>Action</th>
            <th>Entity</th>
            <th>IP</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="text-[var(--admin-text-muted)]">
                {new Date(log.created_at).toLocaleString('en-GB')}
              </td>
              <td>{log.profile?.full_name ?? log.profile?.email ?? '—'}</td>
              <td className="font-medium text-[var(--admin-navy)]">{log.action}</td>
              <td className="text-[var(--admin-text-muted)]">
                {log.entity ?? '—'}
                {log.entity_id ? ` (${log.entity_id.slice(0, 8)}…)` : ''}
              </td>
              <td className="text-[var(--admin-text-muted)]">{log.ip_address ?? '—'}</td>
              <td
                className="max-w-[200px] truncate text-xs text-[var(--admin-text-muted)]"
                title={log.user_agent ?? ''}
              >
                {log.user_agent ? log.user_agent.slice(0, 40) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
