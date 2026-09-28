"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Mail, Pencil, Phone, Search, Trash2, X } from "lucide-react";
import { US_STATES } from "../../lib/us-states";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  number: string;
  address: string;
  state: string;
  vacancy: string;
  status: string;
  ownerSignupLink?: string;
  details?: Record<string, unknown>;
};

type StateSettings = Record<string, { max: number }>;
type StateOccupied = Record<string, number>;

function parseMessage(message: string | undefined) {
  if (!message) return { address: "", state: "" };
  const stateMatch = message.match(/State:\s*([^|]+)/i);
  const addressMatch = message.match(/Address:\s*(.*)$/i);
  return {
    state: stateMatch?.[1]?.trim() || "",
    address: addressMatch?.[1]?.trim() || "",
  };
}

// ── Applications Table ────────────────────────────────────────────────────────

function ApplicationsTable() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/stores/applications")
      .then((r) => r.json())
      .then((data) => {
        const mapped: ApplicationRow[] = (data.applications || []).map((app: Record<string, unknown>) => {
          const applicant = app.applicant as Record<string, string> | undefined;
          const parsed = parseMessage(applicant?.message);
          return {
            id: String(app._id),
            name: applicant?.name || "",
            email: applicant?.email || "",
            number: applicant?.phone || "-",
            address: parsed.address || "-",
            state: parsed.state || "-",
            vacancy: String(app.vacancy ?? "-"),
            status: String(app.status || "forwarded_to_admin"),
            ownerSignupLink: app.ownerSignupLink as string | undefined,
            details: app.application as Record<string, unknown> | undefined,
          };
        });
        setRows(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.state.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rows, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = async (applicationId: string, action: "approve" | "deny") => {
    const res = await fetch(`/api/admin/stores/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) return;
    setRows((prev) => prev.map((r) => {
      if (r.id !== applicationId) return r;
      return {
        ...r,
        status: action === "approve" ? "approved_by_admin" : "denied_by_admin",
        ownerSignupLink: action === "approve" ? `${window.location.origin}/store-signup` : r.ownerSignupLink,
      };
    }));
  };

  const deleteApplication = async (applicationId: string) => {
    if (!window.confirm("Delete this application permanently?")) return;
    const response = await fetch(`/api/admin/stores/applications/${applicationId}`, { method: "DELETE" });
    if (!response.ok) return;
    setRows((current) => current.filter((row) => row.id !== applicationId));
    if (selectedApplication?.id === applicationId) setSelectedApplication(null);
  };

  const statusLabel = (status: string) => {
    if (status === "new") return "New";
    if (status === "approved_by_admin") return "Approved";
    if (status === "denied_by_admin") return "Denied";
    return "Pending";
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6ecef] bg-[#f8fbfc] px-4 py-4">
        <div className="flex w-full max-w-[400px] items-center gap-2 rounded-full border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, state…"
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-[#d8e2e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="forwarded_to_admin">Pending legacy</option>
            <option value="approved_by_admin">Approved</option>
            <option value="denied_by_admin">Denied</option>
          </select>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Download">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[1.2fr_1.2fr_1fr_1.6fr_1fr_0.7fr_0.9fr] border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <div>Name</div><div>Email</div><div>Number</div><div>Address</div><div>State</div><div>Vacancy</div><div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-[#edf2f5]">
            {loading && <div className="px-5 py-8 text-sm text-slate-500">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="px-5 py-8 text-sm text-slate-500">No applications found.</div>}
            {paged.map((row, index) => (
              <div key={`${row.id}-${index}`} className={`grid grid-cols-[1.2fr_1.2fr_1fr_1.6fr_1fr_0.7fr_0.9fr] items-center px-5 py-4 text-sm text-slate-800 ${index % 2 === 1 ? "bg-[#fff8f8]" : "bg-white"}`}>
                <div className="font-medium text-slate-700">{row.name}</div>
                <div className="text-slate-600 truncate">{row.email}</div>
                <div className="text-slate-600">{row.number}</div>
                <div className="max-w-[180px] text-sm leading-5 text-slate-600">{row.address}</div>
                <div className="text-slate-600">{row.state}</div>
                <div className="text-slate-700">{row.vacancy}</div>
                <div className="flex justify-end gap-2 items-center">
                  <button type="button" onClick={() => setSelectedApplication(row)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#8bcbd0] bg-[#f4fbfb] px-2.5 text-[10px] font-semibold text-[#267f8c] shadow-sm transition hover:border-[#2f9fa5] hover:bg-[#e4f7f6]" aria-label={`View application for ${row.name}`} title="View application">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    row.status === "approved_by_admin" ? "bg-green-100 text-green-700"
                    : row.status === "denied_by_admin" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>{statusLabel(row.status)}</span>
                  {row.status !== "approved_by_admin" && row.status !== "denied_by_admin" && (
                    <>
                      <button type="button" onClick={() => updateStatus(row.id, "approve")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-emerald-600 transition hover:bg-emerald-50" aria-label="Approve">
                        ✓
                      </button>
                      <button type="button" onClick={() => updateStatus(row.id, "deny")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-red-500 transition hover:bg-red-50" aria-label="Deny">
                        ⦸
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => deleteApplication(row.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100" aria-label={`Delete application for ${row.name}`} title="Delete application">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        className="border-t border-[#edf2f5]"
      />
      {selectedApplication && (
        <ApplicationDetails application={selectedApplication} onClose={() => setSelectedApplication(null)} />
      )}
    </div>
  );
}

function ApplicationDetails({ application, onClose }: { application: ApplicationRow; onClose: () => void }) {
  const details = application.details ?? {};
  const value = (key: string): string => {
    const item = details[key];
    if (Array.isArray(item)) return item.join(", ");
    if (typeof item === "boolean") return item ? "Yes" : "No";
    return String(item ?? "Not provided");
  };

  const fields: Array<[string, string]> = [
    ["Full name", value("full_name")], ["Email", value("email")], ["Phone", value("phone")],
    ["Preferred contact method", value("preferred_contact_method")], ["State", value("state")],
    ["Business status", value("business_status")], ["Online selling experience", value("online_selling_experience")],
    ["Platforms used", value("platforms_used")], ["Other platform", value("platforms_other")],
    ["Reasons for interest", value("interest_reasons")], ["Other interest reason", value("interest_other")],
    ["Sales channels", value("sales_channels")], ["Other sales channel", value("sales_other")],
    ["Target customers", value("target_customers")], ["Other target customer", value("target_other")],
    ["Weekly time commitment", value("weekly_time_commitment")], ["Planned start", value("planned_start_date")],
    ["Minimum order acknowledgment", value("minimum_order_acknowledgment")], ["Readiness", value("readiness_level")],
    ["Contact consent", value("contact_consent")], ["Privacy acknowledgment", value("privacy_acknowledgment")],
  ];

  const visibleFields = fields.filter(([, fieldValue]) => fieldValue && fieldValue !== "Not provided");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Complete store-owner application">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-[#cfe0e1] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4edef] bg-[#effafa] px-6 py-5 dark:border-slate-700 dark:bg-[#14383d]">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f9fa5]">Complete application</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{application.name}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Status: {application.status}</p></div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#cfe0e1] text-slate-500 transition hover:bg-white dark:border-slate-600 dark:text-slate-300" aria-label="Close application details"><X size={17} /></button>
        </div>
        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-6">
          <div className="mb-6 flex flex-wrap gap-3">
            <a href={`mailto:${value("email")}`} className="inline-flex items-center gap-2 rounded-xl bg-[#2f9fa5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#267f8c]"><Mail size={16} /> Email applicant</a>
            <a href={`tel:${value("phone")}`} className="inline-flex items-center gap-2 rounded-xl border border-[#9bcecf] px-4 py-2.5 text-sm font-semibold text-[#267f8c] transition hover:bg-[#effafa]"><Phone size={16} /> Call applicant</a>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {visibleFields.map(([label, fieldValue]) => <div key={label} className="rounded-2xl border border-[#e0ebeb] bg-[#fbfdfd] p-4 dark:border-slate-700 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 break-words text-sm leading-6 text-slate-800 dark:text-slate-100">{fieldValue}</p></div>)}
          </div>
          {value("applicant_questions") !== "Not provided" && <div className="mt-3 rounded-2xl border border-[#e0ebeb] bg-[#fbfdfd] p-4 dark:border-slate-700 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Applicant questions</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">{value("applicant_questions")}</p></div>}
        </div>
      </div>
    </div>
  );
}

// ── State Availability Table ──────────────────────────────────────────────────

function StateAvailabilityTable({
  monthlyLimit,
  stateSettings,
  stateOccupied,
  onUpdateStateMax,
}: {
  monthlyLimit: number;
  stateSettings: StateSettings;
  stateOccupied: StateOccupied;
  onUpdateStateMax: (state: string, max: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [editingState, setEditingState] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const rows = US_STATES.map((state) => ({
    name: state,
    max: stateSettings[state]?.max ?? monthlyLimit,
    occupied: stateOccupied[state] ?? 0,
  })).filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  const handleEditSave = (state: string) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) return;
    onUpdateStateMax(state, val);
    setEditingState(null);
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e5edf1] bg-[#f8fbfc] px-4 py-4">
        <div className="flex w-full max-w-[400px] items-center gap-2 rounded-full border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state…"
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[1.8fr_0.7fr_0.9fr_0.7fr] border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <div>State</div><div>Max Stores</div><div>Occupied</div><div className="text-right">Action</div>
          </div>
          <div className="divide-y divide-[#edf2f5] max-h-[400px] overflow-y-auto">
            {rows.map((row, index) => (
              <div key={row.name} className={`grid grid-cols-[1.8fr_0.7fr_0.9fr_0.7fr] items-center px-5 py-3 text-sm text-slate-800 ${index % 2 === 0 ? "bg-white" : "bg-[#fbfcfd]"}`}>
                <div className="font-medium text-slate-700">{row.name}</div>
                <div className="text-slate-600">
                  {editingState === row.name ? (
                    <input
                      type="number"
                      min={0}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(row.name); if (e.key === "Escape") setEditingState(null); }}
                      className="w-16 rounded border border-[#6bbdc7] px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[#6bbdc7]"
                      autoFocus
                    />
                  ) : (
                    row.max
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">{row.occupied}</span>
                  {row.max > 0 && (
                    <div className="h-1.5 w-16 rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full ${row.occupied >= row.max ? "bg-red-400" : row.occupied / row.max > 0.8 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min((row.occupied / row.max) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  {editingState === row.name ? (
                    <>
                      <button type="button" onClick={() => handleEditSave(row.name)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200" aria-label="Save">
                        ✓
                      </button>
                      <button type="button" onClick={() => setEditingState(null)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Cancel">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => { setEditingState(row.name); setEditValue(String(row.max)); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label={`Edit ${row.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function StoreApplicationsTables({
  monthlyLimit,
}: {
  monthlyLimit: number;
}) {
  const [stateSettings, setStateSettings] = useState<StateSettings>({});
  const [stateOccupied, setStateOccupied] = useState<StateOccupied>({});

  useEffect(() => {
    fetch("/api/admin/stores/applications/settings")
      .then((r) => r.json())
      .then((d) => {
        setStateSettings(d.stateSettings ?? {});
        setStateOccupied(d.stateOccupied ?? {});
      })
      .catch(() => {});
  }, []);

  const handleUpdateStateMax = async (state: string, max: number) => {
    const updated = { ...stateSettings, [state]: { max } };
    setStateSettings(updated);
    await fetch("/api/admin/stores/applications/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateSettings: updated }),
    });
  };

  return (
    <div className="space-y-4">
      <ApplicationsTable />
      <StateAvailabilityTable
        monthlyLimit={monthlyLimit}
        stateSettings={stateSettings}
        stateOccupied={stateOccupied}
        onUpdateStateMax={handleUpdateStateMax}
      />
    </div>
  );
}
