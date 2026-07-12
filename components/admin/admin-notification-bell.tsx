'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/notifications';
import type { Notification } from '@/types/notification';

type Props = { initialCount?: number };

export function AdminNotificationBell({ initialCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const refresh = () => {
      void getUnreadNotificationCount().then(setCount);
    };
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, []);

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!open) {
      startTransition(async () => {
        const result = await getNotifications();
        if (result.success) setNotifications(result.data ?? []);
      });
    }
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setCount((c) => Math.max(0, c - 1));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setCount(0);
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg border border-slate-200 p-2 dark:border-slate-700"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            {count > 0 && (
              <button
                type="button"
                disabled={pending}
                onClick={handleMarkAllRead}
                className="text-xs text-orange-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-slate-100 px-4 py-3 text-sm last:border-0 dark:border-slate-800 ${n.is_read ? '' : 'bg-orange-50/50 dark:bg-orange-950/20'}`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
                  {n.body && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.body}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {n.link && (
                      <Link href={n.link} className="text-xs font-medium text-orange-600 hover:underline">
                        Open
                      </Link>
                    )}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
