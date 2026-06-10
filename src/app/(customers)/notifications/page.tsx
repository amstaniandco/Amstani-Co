"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
};

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function BellIcon({ unread }: { unread: boolean }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${unread ? "bg-teal-100 dark:bg-teal-900/40" : "bg-slate-100 dark:bg-slate-800"}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${unread ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setNotifications(data?.notifications ?? []);
        // Mark all as read and broadcast so the navbar badge clears
        fetch("/api/notifications", { method: "PATCH" })
          .then(() => window.dispatchEvent(new CustomEvent("notifications-read")))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      <div className="ui-panel rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#111827]">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No notifications yet.</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`ui-subpanel flex items-start justify-between rounded-2xl border p-4 dark:bg-[#0f172a] ${
                  !item.isRead
                    ? "border-teal-200 bg-teal-50/60 dark:border-teal-800/50"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <BellIcon unread={!item.isRead} />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>
                </div>

                <span className="shrink-0 text-sm font-medium text-slate-400 dark:text-slate-500">
                  {relativeTime(item.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
