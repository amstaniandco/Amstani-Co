import Link from "next/link";

const notifications = Array.from({ length: 8 }, (_, idx) => ({
  id: idx + 1,
  title: "Title of the notification",
  message:
    "Notification Message will be written here to let viewer know the exact details",
  time: "9 min ago",
}));

export default function NotificationsPage() {
  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
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
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-200" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                </div>
              </div>

              <span className="text-sm font-medium text-slate-400">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
