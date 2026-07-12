import type { ActivityLog } from '@/types/admin';

type Props = { logs: ActivityLog[] };

export function ActivityLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Who</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
            <th className="px-4 py-3">IP</th>
            <th className="px-4 py-3">Device</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-600">
                {new Date(log.created_at).toLocaleString('en-GB')}
              </td>
              <td className="px-4 py-3">
                {log.profile?.full_name ?? log.profile?.email ?? '—'}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
              <td className="px-4 py-3 text-slate-600">
                {log.entity ?? '—'}
                {log.entity_id ? ` (${log.entity_id.slice(0, 8)}…)` : ''}
              </td>
              <td className="px-4 py-3 text-slate-500">{log.ip_address ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={log.user_agent ?? ''}>
                {log.user_agent ? log.user_agent.slice(0, 40) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
