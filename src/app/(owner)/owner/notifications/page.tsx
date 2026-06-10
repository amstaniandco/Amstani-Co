"use client";

import { Bell, ChevronLeft, Square, Store } from "lucide-react";
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

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <article className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 sm:h-10 sm:w-10">
        <Bell className="h-4 w-4 text-teal-600" />
      </div>
      <div className="min-w-0">
        <h3 className="text-[17px] font-bold leading-tight text-slate-900 sm:text-[18px]">{item.title}</h3>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-700">{item.message}</p>
      </div>
      <p className="col-span-2 pl-[56px] text-xs text-slate-700 sm:col-span-1 sm:justify-self-end sm:pl-0">{relativeTime(item.createdAt)}</p>
    </article>
  );
}

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setNotifications(data?.notifications ?? []))
      .catch(() => {});
    localStorage.setItem("sb_seen_owner_notifications", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "owner_notifications" }));
  }, []);

  return (
    <>
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6"
            >
              <Square className="h-4 w-4" />
              Go Live
            </button>
          </section>

          <button
            type="button"
            className="mt-5 inline-flex items-center gap-1 text-[15px] text-slate-700 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <section className="mt-4 rounded-[36px] bg-white px-4 py-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
            <h2 className="text-[2.35rem] font-bold text-slate-900">Notifications</h2>

            <div className="mt-4 space-y-1 sm:space-y-0.5">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No notifications yet.</p>
              ) : (
                notifications.map((item) => (
                  <NotificationRow key={item._id} item={item} />
                ))
              )}
            </div>
          </section>
    </>
  );
}
