import { ChevronLeft, Square, Store } from "lucide-react";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
};

const notifications: NotificationItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: "Title of the notification",
  message: "Notification Message will be written here to let viewer know the exact details",
  time: "9 min ago",
}));

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <article className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:items-center">
      <div className="h-9 w-9 rounded-full bg-slate-300 sm:h-10 sm:w-10" />
      <div className="min-w-0">
        <h3 className="text-[17px] font-bold leading-tight text-slate-900 sm:text-[18px]">{item.title}</h3>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-700">{item.message}</p>
      </div>
      <p className="col-span-2 pl-[56px] text-xs text-slate-700 sm:col-span-1 sm:justify-self-end sm:pl-0">{item.time}</p>
    </article>
  );
}

export default function OwnerNotificationsPage() {
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
              {notifications.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          </section>
    </>
  );
}
