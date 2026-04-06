"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=5");
        if (res.ok) {
          const data = await res.json();
          const items: Notification[] = data.notifications ?? data.items ?? [];
          setNotifications(items.slice(0, 5));
          setUnreadCount(items.filter((n: Notification) => !n.isRead).length);
        }
      } catch {
        // ignore
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session?.user) return null;

  return (
    <div className="group relative">
      <Link
        href="/account/notifications"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white transition-colors hover:bg-white hover:text-nimbus-600"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-nimbus-500 text-[9px] font-bold text-white ring-2 ring-nimbus-600">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Hover dropdown */}
      <div className="invisible absolute right-0 top-full z-[60] w-80 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="rounded-xl border border-surface-border bg-white p-1.5 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border mb-1">
            <p className="text-sm font-bold text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-nimbus-600">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-text-muted">
              No notifications yet
            </p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link ?? "/account/notifications"}
                    className={`flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-overlay ${
                      !n.isRead ? "bg-nimbus-50/50" : ""
                    }`}
                  >
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-nimbus-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!n.isRead ? "font-bold text-text-primary" : "text-text-secondary"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">{n.message}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-text-muted mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-surface-border mt-1 pt-1">
            <Link
              href="/account/notifications"
              className="block rounded-lg px-3 py-2 text-center text-xs font-bold text-nimbus-600 hover:bg-surface-overlay transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
