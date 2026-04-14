import { Clock3, FolderKanban, Square, Store, TriangleAlert } from "lucide-react";
import OwnerChatSidebar from "../../store/chats/components/OwnerChatSidebar";

type ClaimRow = {
  id: string;
  customer: string;
  issueType: string;
  dueTime: string;
  status: "ESCALATED" | "RESPONDED" | "OPEN";
  statusColor: string;
  highlighted?: boolean;
};

const summaryCards = [
  {
    title: "TOTAL ACTIVE CLAIMS",
    value: "124",
    note: "↘ 4% decrease from last week",
    noteColor: "text-emerald-500",
    tone: "teal",
    icon: FolderKanban,
  },
  {
    title: "ESCALATIONS PENDING",
    value: "12",
    note: "* Requires immediate intervention",
    noteColor: "text-red-600",
    tone: "red",
    icon: TriangleAlert,
  },
  {
    title: "AVG. RESOLUTION TIME",
    value: "18h",
    note: "◔ Within target SLA (24h)",
    noteColor: "text-slate-500",
    tone: "slate",
    icon: Clock3,
  },
];

const claims: ClaimRow[] = [
  {
    id: "#CLM-9021",
    customer: "Sarah Jenkins",
    issueType: "Damaged item",
    dueTime: "06/03/2026",
    status: "ESCALATED",
    statusColor: "text-red-500",
    highlighted: true,
  },
  {
    id: "#CLM-8954",
    customer: "Mark Thompson",
    issueType: "Refund",
    dueTime: "06/03/2026",
    status: "RESPONDED",
    statusColor: "text-[#0e8090]",
  },
  {
    id: "#CLM-8942",
    customer: "Jessica Alba",
    issueType: "Missing item",
    dueTime: "06/03/2026",
    status: "OPEN",
    statusColor: "text-slate-500",
  },
];

function SummaryCard({
  title,
  value,
  note,
  noteColor,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  noteColor: string;
  tone: "teal" | "red" | "slate";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const borderTone = tone === "red" ? "border-red-200 bg-red-50" : tone === "teal" ? "border-slate-200 bg-white" : "border-slate-200 bg-white";

  return (
    <article className={`rounded-2xl border ${borderTone} px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]`}>
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone === "red" ? "bg-red-100 text-red-500" : tone === "teal" ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-500"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">{title}</p>
      <p className={`mt-1 text-[32px] font-extrabold leading-none ${tone === "red" ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      <p className={`mt-3 text-[11px] font-semibold ${noteColor}`}>{note}</p>
    </article>
  );
}

function ClaimsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="grid h-5 w-5 place-items-center rounded-sm bg-[#0e8090] text-white">
            <span className="text-[11px] font-bold">▦</span>
          </div>
          <h3 className="text-[15px] font-bold">Global Claims &amp; Escalations</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="rounded-full bg-[#65bbc5] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#53aab5]"
          >
            Filter by Priority
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[1fr_1.15fr_1.05fr_0.95fr_0.9fr_1.35fr] border-t border-slate-200 bg-slate-50 px-4 py-4 text-[11px] font-extrabold uppercase leading-4 tracking-[0.08em] text-slate-700 sm:px-5">
            <div>
              <span>Claim</span>
              <br />
              <span>ID</span>
            </div>
            <div>Customer</div>
            <div>
              <span>Issue</span>
              <br />
              <span>Type</span>
            </div>
            <div>
              <span>Due</span>
              <br />
              <span>Time</span>
            </div>
            <div>Status</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className={`grid grid-cols-[1fr_1.15fr_1.05fr_0.95fr_0.9fr_1.35fr] items-center px-4 py-6 text-sm sm:px-5 ${
                  claim.highlighted ? "border-l-4 border-red-500 bg-red-50/35" : ""
                }`}
              >
                <div className={`whitespace-pre-line text-[12px] font-semibold leading-4 ${claim.highlighted ? "text-slate-600" : "text-slate-400"}`}>
                  {claim.id.replace("-", "-\n")}
                </div>
                <div className="whitespace-pre-line text-[12px] leading-5 text-slate-700">{claim.customer.replace(" ", "\n")}</div>
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[12px] text-slate-500">{claim.issueType}</span>
                </div>
                <div className="text-[12px] text-slate-700">{claim.dueTime}</div>
                <div className={`text-[12px] font-bold tracking-[0.02em] ${claim.statusColor}`}>{claim.status}</div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    View Items
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Resolve
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

export default function OwnerClaimsPage() {
  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Claims" />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
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

          <section className="mt-8">
            <h2 className="text-[26px] font-bold text-slate-900">Claim and Resolution Centre</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor customer disputes and platform-wide activity logs.</p>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <ClaimsTable />
          </section>
        </main>
      </div>
    </div>
  );
}
