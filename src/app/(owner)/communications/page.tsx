import {
  CalendarDays,
  CircleAlert,
  Clock3,
  EllipsisVertical,
  Info,
  Mail,
  PenLine,
  Plus,
  Square,
  Store,
} from "lucide-react";

type TemplateCard = {
  title: string;
  description: string;
  trigger: string;
  icon: "mail" | "alert" | "info";
  enabled: boolean;
};

type Announcement = {
  title: string;
  body: string;
  audience: string;
  schedule: string;
  scheduleType: "live" | "time";
  status: "Live" | "DRAFT";
};

const templateCards: TemplateCard[] = [
  {
    title: "Order Acceptance",
    description: "Sent to customer when merchant accepts the order",
    trigger: "ORDER_STATUS_ACCEPTED",
    icon: "mail",
    enabled: true,
  },
  {
    title: "Order on Hold",
    description: "Notification for inventory discrepancies or verification.",
    trigger: "STOCK_EXCEPTION_HOLD",
    icon: "alert",
    enabled: true,
  },
  {
    title: "Status Update",
    description: "General update for stage progression in processing.",
    trigger: "LIFECYCLE_STAGE_CHANGE",
    icon: "info",
    enabled: false,
  },
];

const announcements: Announcement[] = [
  {
    title: "Black Friday Sale",
    body: "Starting today, get 20% off all items.",
    audience: "Followers",
    schedule: "Live Now",
    scheduleType: "live",
    status: "Live",
  },
  {
    title: "New Items In Stock",
    body: "New items have been added to the inventory",
    audience: "Followers",
    schedule: "Oct 24, 09:00 AM",
    scheduleType: "time",
    status: "DRAFT",
  },
  {
    title: "Customisable Shoes",
    body: "We are now offering customisable shoes.",
    audience: "Followers",
    schedule: "Live Now",
    scheduleType: "live",
    status: "Live",
  },
];

function TemplateIcon({ icon }: { icon: TemplateCard["icon"] }) {
  if (icon === "mail") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#66c4cf]/25 text-[#3daebc]">
        <Mail className="h-5 w-5" />
      </div>
    );
  }

  if (icon === "alert") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#f8a94a]/20 text-[#f08c22]">
        <CircleAlert className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#66c4cf]/25 text-[#3daebc]">
      <Info className="h-5 w-5" />
    </div>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`relative inline-flex h-[22px] w-10 items-center rounded-full transition ${
        enabled ? "bg-[#007f88]" : "bg-slate-200"
      }`}
    >
      <span
        className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition ${
          enabled ? "translate-x-[20px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function TemplateCardItem({ item }: { item: TemplateCard }) {
  return (
    <article className="min-h-[236px] rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <TemplateIcon icon={item.icon} />
        <Toggle enabled={item.enabled} />
      </div>

      <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-[22px]">{item.title}</h3>
      <p className="mt-1 text-[12px] leading-[1.35] text-slate-500">{item.description}</p>

      <div className="mt-3 rounded-md bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Trigger:</p>
        <p className="mt-1 text-[13px] font-semibold text-slate-600">{item.trigger}</p>
      </div>

      <button
        type="button"
        className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 py-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <PenLine className="h-3.5 w-3.5" />
        Edit Design/Logic
      </button>
    </article>
  );
}

function AnnouncementsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[2.4fr_1.2fr_1.4fr_1fr_0.45fr] border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:px-6">
            <div>Message Content</div>
            <div>Target Audience</div>
            <div>Schedule</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {announcements.map((announcement, index) => (
              <div
                key={`${announcement.title}-${index}`}
                className="grid grid-cols-[2.4fr_1.2fr_1.4fr_1fr_0.45fr] items-center px-4 py-3 text-sm sm:px-6"
              >
                <div>
                  <p className="font-bold text-slate-800">{announcement.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{announcement.body}</p>
                </div>

                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {announcement.audience}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  {announcement.scheduleType === "live" ? (
                    <CalendarDays className="h-3.5 w-3.5" />
                  ) : (
                    <Clock3 className="h-3.5 w-3.5" />
                  )}
                  <span>{announcement.schedule}</span>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      announcement.status === "Live" ? "text-emerald-500" : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        announcement.status === "Live" ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    {announcement.status}
                  </span>
                </div>

                <div className="flex justify-end text-slate-400">
                  <button type="button">
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerCommunicationsPage() {
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

          <section className="mt-6">
            <h2 className="text-xl font-bold text-slate-900 sm:text-[25px]">Automated Email Templates &amp; Triggers</h2>
            <p className="mt-1 text-sm text-slate-500">System-wide notifications based on transaction events.</p>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {templateCards.map((item) => (
                <TemplateCardItem key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-[25px]">Global Announcements &amp; Banners</h2>
                <p className="mt-1 text-sm text-slate-500">Manage push notifications and dashboard banners for merchants.</p>
              </div>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <AnnouncementsTable />
          </section>
    </>
  );
}
