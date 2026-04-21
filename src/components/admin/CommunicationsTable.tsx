import { CalendarDays, Clock3, MoreVertical } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  schedule: string;
  liveNow?: boolean;
  status: "Live" | "Draft";
};

const announcements: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Tonight",
    subtitle: "Expected downtime: 2:00 AM - 4:00 AM UTC.",
    audience: "All Stores",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "2",
    title: "New Policy: Handling Fragile Items",
    subtitle: "Please review the updated shipping guidelines.",
    audience: "Stores & Customers",
    schedule: "Oct 24, 09:00 AM",
    status: "Draft",
  },
  {
    id: "3",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "4",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "5",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "6",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "7",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
  {
    id: "8",
    title: "Holiday Season Readiness",
    subtitle: "Promotional kits are now available for request.",
    audience: "Customers",
    schedule: "Live Now",
    liveNow: true,
    status: "Live",
  },
];

function getStatusClass(status: Announcement["status"]) {
  if (status === "Live") {
    return "text-[#16a34a]";
  }

  return "text-slate-500";
}

export default function CommunicationsTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#dbe5ea] bg-white">
      <table className="w-full min-w-[920px] border-collapse text-left text-xs sm:text-sm">
        <thead className="border-b border-[#e6edf2] bg-[#f8fbfd] text-[10px] uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Message Content</th>
            <th className="px-4 py-3 font-semibold">Target Audience</th>
            <th className="px-4 py-3 font-semibold">Schedule</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((item) => (
            <tr key={item.id} className="border-b border-[#edf2f6] text-slate-700">
              <td className="px-4 py-3.5">
                <p className="text-[22px] font-semibold leading-5 text-slate-800">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
              </td>
              <td className="px-4 py-3.5">
                <span className="inline-flex rounded-md bg-[#eef3f7] px-2.5 py-1 text-xs font-medium text-slate-700">
                  {item.audience}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  {item.liveNow ? <Clock3 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                  {item.schedule}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${getStatusClass(item.status)}`}>
                  <span className={`h-2 w-2 rounded-full ${item.status === "Live" ? "bg-[#22c55e]" : "bg-[#cbd5e1]"}`} />
                  {item.status === "Live" ? "Live" : "DRAFT"}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Row actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
