"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setNotifications(data?.notifications ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
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
                className="ui-subpanel flex items-start justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-[#0f172a]"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>
                </div>

                <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
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
