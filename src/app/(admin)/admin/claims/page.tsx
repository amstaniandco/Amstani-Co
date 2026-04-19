import { AlertTriangle, Clock3, FileBarChart2, Filter, RotateCcw, ShieldAlert } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

type ClaimRow = {
  id: string;
  storeName: string;
  customer: string;
  issueType: string;
  status: "Escalated" | "Responded" | "Open";
  action: string;
};

type TimelineItem = {
  id: string;
  title: string;
  time: string;
  note: string;
  escalated?: boolean;
};

const claimRows: ClaimRow[] = [
  {
    id: "#CLM-9021",
    storeName: "Luxe Furnishings",
    customer: "Sarah Jenkins",
    issueType: "Damaged",
    status: "Escalated",
    action: "Intervene",
  },
  {
    id: "#CLM-8954",
    storeName: "Tech Haven",
    customer: "Mark Thompson",
    issueType: "Refund",
    status: "Responded",
    action: "Review",
  },
  {
    id: "#CLM-8942",
    storeName: "Urban Threads",
    customer: "Jessica Alba",
    issueType: "Missing",
    status: "Open",
    action: "Review",
  },
];

const timeline: TimelineItem[] = [
  {
    id: "1",
    title: "Customer raised claim",
    time: "Oct 24, 09:12 AM",
    note: '"Received damaged table leg."',
  },
  {
    id: "2",
    title: "Vendor replied",
    time: "Oct 24, 14:45 PM",
    note: 'Offered 10% discount for repair.',
  },
  {
    id: "3",
    title: "Customer rejected",
    time: "Oct 25, 10:05 AM",
    note: '"Insufficient. Demand full replacement."',
  },
  {
    id: "4",
    title: "Escalated to Super Admin",
    time: "Oct 25, 10:06 AM",
    note: "System-triggered: High-value dispute threshold exceeded.",
    escalated: true,
  },
];

function getStatusClass(status: ClaimRow["status"]) {
  if (status === "Escalated") {
    return "text-[#dc2626]";
  }

  if (status === "Responded") {
    return "text-[#0f766e]";
  }

  return "text-slate-500";
}

export default function AdminClaimsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/claims" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar searchPlaceholder="Search claims, stores, or audit logs..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Claims & Resolution Center</h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Monitor global customer disputes and platform-wide activity logs.
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 sm:text-[11px]">
                  <FileBarChart2 className="h-4 w-4" />
                  Total Active Claims
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">124</p>
                <p className="mt-1 text-xs font-semibold text-[#16a34a]">↘ 4% decrease</p>
              </article>

              <article className="rounded-lg border border-[#f1b4b4] bg-[#fff1f1] p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#dc2626] sm:text-[11px]">
                  <ShieldAlert className="h-4 w-4" />
                  Escalations Pending
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#b91c1c] sm:text-4xl">12</p>
                <p className="mt-1 text-xs font-semibold text-[#dc2626]">Needs action</p>
              </article>

              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4 sm:col-span-2 lg:col-span-1">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 sm:text-[11px]">
                  <Clock3 className="h-4 w-4" />
                  Avg. Resolution Time
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">18h</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Within SLA (24h)</p>
              </article>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
              <section className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900 sm:text-xl md:text-2xl">
                    <AlertTriangle className="h-4 w-4 text-[#0f766e]" />
                    Global Claims & Escalations
                  </h2>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-[#dbe5ea] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5db1bb]"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-2.5 md:hidden">
                  {claimRows.map((row) => (
                    <div key={row.id} className="rounded-lg border border-[#e6edf2] bg-[#f8fbfd] p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-[10px] font-medium text-[#8ca3b6]">{row.id}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{row.storeName}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold flex-shrink-0 uppercase tracking-[0.06em] ${getStatusClass(row.status)} ${row.status === "Escalated" ? "bg-[#ffe9e9]" : row.status === "Responded" ? "bg-[#d7f3f0]" : "bg-[#f3f4f6]"}`}>
                          {row.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-2 space-y-0.5">
                        <div>Customer: <span className="font-medium">{row.customer}</span></div>
                        <div>Issue: <span className="inline-block bg-[#eef3f7] px-1.5 py-0.5 rounded text-[10px]">{row.issueType}</span></div>
                      </div>
                      <button
                        type="button"
                        className={`w-full inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                          row.action === "Intervene"
                            ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                            : "border border-[#dbe5ea] bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {row.action}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-[#e6edf2]">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead className="border-b border-[#e6edf2] bg-[#f8fbfd] text-[10px] uppercase tracking-[0.08em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Claim ID</th>
                        <th className="px-3 py-2.5 font-semibold">Store Name</th>
                        <th className="px-3 py-2.5 font-semibold">Customer</th>
                        <th className="px-3 py-2.5 font-semibold">Issue Type</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimRows.map((row) => (
                        <tr key={row.id} className="border-b border-[#edf2f6] text-slate-700">
                          <td className="px-3 py-3 font-medium text-[#8ca3b6]">{row.id}</td>
                          <td className="px-3 py-3 font-semibold text-slate-800">{row.storeName}</td>
                          <td className="px-3 py-3">{row.customer}</td>
                          <td className="px-3 py-3">
                            <span className="inline-flex rounded-md bg-[#eef3f7] px-2 py-1 text-[11px] font-medium text-slate-700">
                              {row.issueType}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs font-semibold uppercase tracking-[0.06em] ${getStatusClass(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                row.action === "Intervene"
                                  ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                                  : "border border-[#dbe5ea] bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {row.action}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <aside className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4 md:col-span-2 xl:col-span-1">
                <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg md:text-xl">
                  <RotateCcw className="h-4 w-4 text-[#0f766e]" />
                  Claim Lifecycle: #CLM-9021
                </h2>

                <div className="mt-4 space-y-3">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.escalated ? "bg-[#dc2626]" : "bg-[#9fb2c2]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold sm:text-sm ${item.escalated ? "text-[#dc2626]" : "text-slate-800"}`}>
                          {item.title}
                        </p>
                        <p className={`text-[10px] sm:text-xs ${item.escalated ? "text-[#ef4444]" : "text-slate-500"}`}>{item.time}</p>
                        <p
                          className={`mt-1 rounded-md px-2 py-1 text-xs ${
                            item.escalated ? "bg-[#ffe9e9] text-[#b91c1c]" : "text-slate-600"
                          }`}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
