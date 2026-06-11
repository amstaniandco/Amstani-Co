"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  FileBarChart2,
  Filter,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import { useHighlightRow } from "../../../../components/admin/useHighlightRow";

type ClaimMessage = {
  senderId: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin";
  content: string;
  timestamp: string;
};

type ClaimItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string;
};

type Claim = {
  _id: string;
  claimNumber: string;
  customerName: string;
  storeName: string;
  reason: string;
  description: string;
  items: ClaimItem[];
  mediaUrls?: string[];
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  messages: ClaimMessage[];
  adminIntervened?: boolean;
  resolveRequestPending?: boolean;
  resolveApprovedByAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  escalated: number;
  avgResolutionHours: number;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  owner_responded: "Responded",
  resolved: "Resolved",
  admin_escalated: "Escalated",
  awaiting_reorder: "Awaiting Reorder",
};

const ISSUE_LABEL: Record<string, string> = {
  damaged: "Damaged",
  missing: "Missing",
  refund: "Refund",
  wrong: "Wrong item",
  other: "Other",
};

function getStatusClass(status: string) {
  if (status === "admin_escalated") return "text-[#dc2626]";
  if (status === "owner_responded") return "text-[#0f766e]";
  if (status === "resolved") return "text-blue-500";
  if (status === "awaiting_reorder") return "text-purple-600";
  return "text-slate-500";
}

function interveneButtonMeta(reason: string): { label: string; cls: string } {
  if (reason === "wrong") {
    return {
      label: "Resolve — Ask to Reorder",
      cls: "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60",
    };
  }
  if (reason === "refund") {
    return {
      label: "Mark Resolved",
      cls: "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-60",
    };
  }
  return {
    label: "Resolve & Resend",
    cls: "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-60",
  };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, escalated: 0, avgResolutionHours: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [intervening, setIntervening] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Highlight + scroll to a claim when arriving from global search (?highlight=<id>)
  useHighlightRow(!loading);

  async function loadClaims() {
    try {
      const res = await fetch("/api/admin/claims");
      if (!res.ok) return;
      const data = await res.json();
      const fetched: Claim[] = data.claims || [];
      setClaims(fetched);
      setStats(data.stats || { total: 0, escalated: 0, avgResolutionHours: 0 });
      setSelectedClaim((prev) => {
        if (!prev) {
          return fetched.find((c) => c.status === "admin_escalated") || fetched[0] || null;
        }
        // Always sync with fresh data so buttons reflect current state
        return fetched.find((c) => c._id === prev._id) || prev;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClaims(); }, []);

  useEffect(() => {
    localStorage.setItem("sb_seen_admin_claims", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "admin_claims" }));
  }, []);

  async function handleIntervene(claim: Claim) {
    setIntervening(true);
    try {
      const res = await fetch(`/api/admin/claims/${claim._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return;
      await loadClaims();
    } finally {
      setIntervening(false);
    }
  }

  async function handleApproveResolve(claim: Claim) {
    try {
      const res = await fetch(`/api/admin/claims/${claim._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_resolve" }),
      });
      if (!res.ok) return;
      await loadClaims();
    } catch {
      // silent
    }
  }

  const filtered =
    filterStatus === "all"
      ? claims
      : claims.filter((c) => c.status === filterStatus);

  const timelineEvents = selectedClaim
    ? selectedClaim.messages.map((msg, i) => {
        let title = "";
        if (msg.senderRole === "user") {
          title = i === 0 ? "Customer raised claim" : "Customer replied";
        } else if (msg.senderRole === "owner") {
          title = "Store owner replied";
        } else {
          title = "Admin intervened";
        }
        return {
          id: String(i),
          title,
          time: new Date(msg.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          note: msg.content,
          isAdmin: msg.senderRole === "admin",
          isEscalated:
            msg.senderRole === "admin" ||
            (selectedClaim.status === "admin_escalated" && i === selectedClaim.messages.length - 1),
        };
      })
    : [];

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/claims" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar searchPlaceholder="Search claims, stores, or audit logs..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Claims & Resolution Center
              </h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Monitor global customer disputes and platform-wide activity logs.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-4 grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 sm:text-[11px]">
                  <FileBarChart2 className="h-4 w-4" />
                  Total Active Claims
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                  {loading ? "—" : stats.total}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#16a34a]">Platform-wide</p>
              </article>

              <article className="rounded-lg border border-[#f1b4b4] bg-[#fff1f1] p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#dc2626] sm:text-[11px]">
                  <ShieldAlert className="h-4 w-4" />
                  Escalations Pending
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#b91c1c] sm:text-4xl">
                  {loading ? "—" : stats.escalated}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#dc2626]">Needs action</p>
              </article>

              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4 sm:col-span-2 lg:col-span-1">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 sm:text-[11px]">
                  <Clock3 className="h-4 w-4" />
                  Avg. Resolution Time
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                  {loading ? "—" : `${stats.avgResolutionHours}h`}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {stats.avgResolutionHours > 0 ? "Based on resolved claims" : "No resolved claims yet"}
                </p>
              </article>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
              {/* Claims Table */}
              <section className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900 sm:text-xl">
                    <AlertTriangle className="h-4 w-4 text-[#0f766e]" />
                    Global Claims & Escalations
                  </h2>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none rounded-lg border border-[#dbe5ea] bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="admin_escalated">Escalated</option>
                        <option value="open">Open</option>
                        <option value="owner_responded">Responded</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <Filter className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-2.5 md:hidden">
                  {loading ? (
                    <p className="text-sm text-slate-400 text-center py-4">Loading…</p>
                  ) : filtered.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No claims found.</p>
                  ) : (
                    filtered.map((row) => (
                      <div
                        key={row._id}
                        data-row-id={row._id}
                        onClick={() => setSelectedClaim(row)}
                        className="rounded-lg border border-[#e6edf2] bg-[#f8fbfd] p-3 cursor-pointer hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-[10px] font-medium text-[#8ca3b6]">
                              #{row.claimNumber}
                            </p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">
                              {row.storeName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold flex-shrink-0 uppercase tracking-[0.06em] ${getStatusClass(row.status)} ${
                              row.status === "admin_escalated"
                                ? "bg-[#ffe9e9]"
                                : row.status === "owner_responded"
                                ? "bg-[#d7f3f0]"
                                : "bg-[#f3f4f6]"
                            }`}
                          >
                            {STATUS_LABEL[row.status]}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mb-2 space-y-0.5">
                          <div>
                            Customer: <span className="font-medium">{row.customerName}</span>
                          </div>
                          <div>
                            Issue:{" "}
                            <span className="inline-block bg-[#eef3f7] px-1.5 py-0.5 rounded text-[10px]">
                              {ISSUE_LABEL[row.reason] || row.reason}
                            </span>
                          </div>
                        </div>
                        {row.resolveRequestPending && !row.resolveApprovedByAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveResolve(row); }}
                            className="w-full inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Approve Resolve
                          </button>
                        )}
                        {row.status === "admin_escalated" && (() => {
                          const { label, cls } = interveneButtonMeta(row.reason);
                          return (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleIntervene(row); }}
                              disabled={intervening}
                              className={`w-full ${cls}`}
                            >
                              {label}
                            </button>
                          );
                        })()}
                      </div>
                    ))
                  )}
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
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                            Loading claims…
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                            No claims found.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((row) => (
                          <tr
                            key={row._id}
                            data-row-id={row._id}
                            onClick={() => setSelectedClaim(row)}
                            className={`border-b border-[#edf2f6] text-slate-700 cursor-pointer hover:bg-slate-50 ${
                              selectedClaim?._id === row._id ? "bg-slate-50" : ""
                            }`}
                          >
                            <td className="px-3 py-3 font-medium text-[#8ca3b6]">
                              #{row.claimNumber}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-800">
                              {row.storeName}
                            </td>
                            <td className="px-3 py-3">{row.customerName}</td>
                            <td className="px-3 py-3">
                              <span className="inline-flex rounded-md bg-[#eef3f7] px-2 py-1 text-[11px] font-medium text-slate-700">
                                {ISSUE_LABEL[row.reason] || row.reason}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-xs font-semibold uppercase tracking-[0.06em] ${getStatusClass(row.status)}`}
                              >
                                {STATUS_LABEL[row.status]}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {row.resolveRequestPending && !row.resolveApprovedByAdmin && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleApproveResolve(row); }}
                                    className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    Approve Resolve
                                  </button>
                                )}
                                {row.status === "admin_escalated" ? (() => {
                                  const { label, cls } = interveneButtonMeta(row.reason);
                                  return (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleIntervene(row); }}
                                      disabled={intervening}
                                      className={cls}
                                    >
                                      {label}
                                    </button>
                                  );
                                })() : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedClaim(row); }}
                                    className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold border border-[#dbe5ea] bg-white text-slate-700 hover:bg-slate-50"
                                  >
                                    Review
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Timeline Panel */}
              <aside className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4 md:col-span-2 xl:col-span-1">
                <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                  <RotateCcw className="h-4 w-4 text-[#0f766e]" />
                  {selectedClaim
                    ? `Claim Lifecycle: #${selectedClaim.claimNumber}`
                    : "Claim Lifecycle"}
                </h2>

                {!selectedClaim ? (
                  <p className="mt-4 text-sm text-slate-400">
                    Select a claim from the table to view its lifecycle.
                  </p>
                ) : (
                  <>
                  {selectedClaim.mediaUrls && selectedClaim.mediaUrls.length > 0 && (
                    <div className="mt-3 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Photo Evidence</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClaim.mediaUrls.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxUrl(url)}
                            className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#dbe5ea] hover:opacity-80 transition-opacity"
                          >
                            <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {timelineEvents.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No activity yet.</p>
                  ) : (
                  <div className="mt-4 space-y-3">
                    {timelineEvents.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            item.isEscalated ? "bg-[#dc2626]" : "bg-[#9fb2c2]"
                          }`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold sm:text-sm ${
                              item.isEscalated ? "text-[#dc2626]" : "text-slate-800"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p
                            className={`text-[10px] sm:text-xs ${
                              item.isEscalated ? "text-[#ef4444]" : "text-slate-500"
                            }`}
                          >
                            {item.time}
                          </p>
                          <p
                            className={`mt-1 rounded-md px-2 py-1 text-xs ${
                              item.isEscalated
                                ? "bg-[#ffe9e9] text-[#b91c1c]"
                                : "text-slate-600"
                            }`}
                          >
                            {item.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                  </>
                )}

                {selectedClaim && selectedClaim.resolveRequestPending && !selectedClaim.resolveApprovedByAdmin && (
                  <button
                    onClick={() => handleApproveResolve(selectedClaim)}
                    className="mt-5 w-full rounded-lg px-3 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Approve Owner&apos;s Resolve Request
                  </button>
                )}
                {selectedClaim && selectedClaim.status === "admin_escalated" && (() => {
                  const { label, cls } = interveneButtonMeta(selectedClaim.reason);
                  return (
                    <button
                      onClick={() => handleIntervene(selectedClaim)}
                      disabled={intervening}
                      className={`mt-2 w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${cls}`}
                    >
                      {intervening ? "Processing…" : label}
                    </button>
                  );
                })()}
              </aside>
            </div>
          </section>
        </main>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
