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
import { adminLinkClass } from '@/components/admin/admin-styles';

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
        className="admin-notification-btn"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1 text-[10px] font-bold text-[var(--admin-navy)]">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="admin-notification-panel">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--admin-navy)]">Notifications</p>
            {count > 0 && (
              <button
                type="button"
                disabled={pending}
                onClick={handleMarkAllRead}
                className={`text-xs ${adminLinkClass}`}
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[var(--admin-text-muted)]">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-[var(--admin-border-light)] px-4 py-3 text-sm last:border-0 ${n.is_read ? '' : 'admin-notification-item--unread'}`}
                >
                  <p className="font-medium text-[var(--admin-navy)]">{n.title}</p>
                  {n.body && <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{n.body}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {n.link && (
                      <Link href={n.link} className={`text-xs font-medium ${adminLinkClass}`}>
                        Open
                      </Link>
                    )}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
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
