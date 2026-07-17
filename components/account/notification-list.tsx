'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { markCustomerNotificationRead } from '@/actions/customer-portal';
import type { Notification } from '@/types/notification';

type Props = { notifications: Notification[] };

export function NotificationList({ notifications: initial }: Props) {
  const [pending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await markCustomerNotificationRead(id);
    });
  }

  if (initial.length === 0) {
    return <p className="text-sm text-slate-600">No notifications yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {initial.map((n) => (
        <li
          key={n.id}
          className={`rounded-xl border p-4 ${n.is_read ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-slate-600">{n.body}</p>}
              <p className="mt-2 text-xs text-slate-500">{new Date(n.created_at).toLocaleString('en-GB')}</p>
              {n.link && (
                <Link href={n.link} className="mt-2 inline-block text-sm font-medium text-orange-800 hover:underline">
                  View details →
                </Link>
              )}
            </div>
            {!n.is_read && (
              <button type="button" disabled={pending} onClick={() => markRead(n.id)} className="text-xs text-slate-500 hover:text-slate-800">
                Mark read
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
