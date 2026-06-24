"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, Check, TrendingUp, ShoppingBag, CreditCard, Clock } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

const RANGE_OPTIONS = [
  { key: "all",   label: "All Time" },
  { key: "today", label: "Today" },
  { key: "7d",    label: "Last 7 Days" },
  { key: "30d",   label: "Last 30 Days" },
  { key: "90d",   label: "Last 90 Days" },
  { key: "year",  label: "This Year" },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

type RevenuePoint  = { state: string; value: string; barHeight: number };
type StoreRevenue  = { name: string; sales: string; amount: string };
type InventoryRow  = {
  sku: string;
  product: string;
  category: string;
  brand: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};
type Summary = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
};

function statusClass(status: InventoryRow["status"]) {
  if (status === "In Stock")   return "bg-[#d7f3f0] text-[#0f766e]";
  if (status === "Low Stock")  return "bg-[#ffe8d8] text-[#c05621]";
  return "bg-[#ffe2e2] text-[#c53030]";
}

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(2)}`;
}

const PAGE_SIZE = 20;

export default function AdminFinanceStockPage() {
  const toast = useToast();

  // Finance summary
  const [summary, setSummary]           = useState<Summary | null>(null);
  const [revenueByState, setByState]    = useState<RevenuePoint[]>([]);
  const [storeRevenues, setByStore]     = useState<StoreRevenue[]>([]);
  const [financeLoading, setFinanceLoading] = useState(true);

  // Time-range filter
  const [range, setRange]       = useState<RangeKey>("all");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);
  const rangeLabel = RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "All Time";

  // Close the range dropdown on outside click
  useEffect(() => {
    if (!rangeOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [rangeOpen]);

  // Inventory
  const [rows, setRows]     = useState<InventoryRow[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery]   = useState("");
  const [invLoading, setInvLoading] = useState(true);
  const [lastSync, setLastSync]     = useState("");

  // Load finance summary (re-fetches whenever the time range changes)
  useEffect(() => {
    setFinanceLoading(true);
    fetch(`/api/admin/finance-stock?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); return; }
        setSummary(data.summary);
        setByState(data.revenueByState ?? []);
        setByStore(data.storeRevenues ?? []);
      })
      .catch(() => toast.error("Failed to load finance data"))
      .finally(() => setFinanceLoading(false));
  }, [range, toast]);

  // Load inventory
  useEffect(() => {
    setInvLoading(true);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
    if (query) params.set("q", query);

    fetch(`/api/admin/finance-stock/inventory?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); setRows([]); return; }
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setLastSync(new Date().toLocaleTimeString());
      })
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setInvLoading(false));
  }, [page, query, toast]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/finance-stock" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar searchPlaceholder="Search financials or stock..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:pb-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">Revenue & Inventory Monitoring</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">Real-time financial performance and stock logistics oversight.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div ref={rangeRef} className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setRangeOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={rangeOpen}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#dbe5ea] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:text-sm"
                  >
                    {rangeLabel} <ChevronDown className={`h-4 w-4 transition-transform ${rangeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {rangeOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 z-20 mt-1 w-full min-w-[180px] overflow-hidden rounded-lg border border-[#dbe5ea] bg-white py-1 shadow-lg sm:w-48"
                    >
                      {RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          role="option"
                          aria-selected={range === option.key}
                          onClick={() => { setRange(option.key); setRangeOpen(false); }}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                            range === option.key ? "font-semibold text-[#338ca0]" : "text-slate-700"
                          }`}
                        >
                          {option.label}
                          {range === option.key && <Check className="h-4 w-4 text-[#338ca0]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6bbdc7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5baeb8] sm:w-auto sm:text-sm">
                  <Download className="h-4 w-4" /> Export Report
                </button>
              </div>
            </div>

            {/* Summary stat cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                label="Total Revenue"
                value={financeLoading ? "…" : fmt(summary?.totalRevenue ?? 0)}
                bg="bg-emerald-50"
              />
              <StatCard
                icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
                label="Total Orders"
                value={financeLoading ? "…" : String(summary?.totalOrders ?? 0)}
                bg="bg-blue-50"
              />
              <StatCard
                icon={<CreditCard className="h-5 w-5 text-teal-600" />}
                label="Paid Orders"
                value={financeLoading ? "…" : String(summary?.paidOrders ?? 0)}
                bg="bg-teal-50"
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                label="Pending Orders"
                value={financeLoading ? "…" : String(summary?.pendingOrders ?? 0)}
                bg="bg-amber-50"
              />
            </div>

            {/* Revenue charts */}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
              {/* Revenue by state bar chart */}
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">Revenue by State</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Paid Orders Only</p>
                </div>
                {financeLoading ? (
                  <div className="h-[160px] animate-pulse rounded-lg bg-slate-100" />
                ) : revenueByState.length === 0 ? (
                  <div className="flex h-[160px] items-center justify-center text-sm text-slate-400">No paid orders yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex h-[140px] min-w-[280px] items-end justify-between gap-1.5 border-b border-[#e5edf1] pb-4 sm:gap-2 sm:min-w-[420px] sm:h-[160px]">
                      {revenueByState.map((point) => (
                        <div key={point.state} className="flex min-w-[28px] flex-1 flex-col items-center gap-1.5 sm:min-w-[36px] sm:gap-2">
                          <span className="text-[9px] font-semibold text-[#2f8ea3] sm:text-[10px]">{point.value}</span>
                          <div className="w-5 rounded-t-md bg-gradient-to-t from-[#6bbdc7] to-[#8fd1d8] sm:w-7" style={{ height: `${Math.max(point.barHeight * 0.85, 4)}px` }} />
                          <span className="text-[9px] font-medium text-slate-600 sm:text-[10px]">{point.state}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* Store-wise revenue */}
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <h2 className="mb-4 text-sm font-bold text-slate-800 sm:text-base">Store-wise Revenue</h2>
                {financeLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
                  </div>
                ) : storeRevenues.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-sm text-slate-400">No revenue data yet</div>
                ) : (
                  <div className="space-y-2">
                    {storeRevenues.map((store) => (
                      <div key={store.name} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">{store.name}</p>
                            <p className="text-[10px] text-slate-500">{store.sales}</p>
                          </div>
                          <p className="flex-shrink-0 text-xs font-bold text-slate-800 sm:text-sm">{store.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>

            {/* Master Inventory Monitor */}
            <article className="mt-4 rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                  Master Inventory Monitor
                  <span className="ml-1 text-[10px] font-normal text-slate-500 sm:text-[11px]">(View-Only)</span>
                </h2>
                <span className="w-fit rounded-md bg-[#f4f8fb] px-2 py-1 text-[10px] font-medium text-slate-500">
                  {lastSync ? `Last Sync: ${lastSync}` : "Loading…"}
                </span>
              </div>

              <form onSubmit={handleSearch} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, SKU, category or brand…"
                  className="w-full rounded-lg border border-[#dbe5ea] px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6bbdc7]"
                />
                <button type="submit" className="rounded-lg bg-[#6bbdc7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5baeb8]">
                  Search
                </button>
                {query && (
                  <button type="button" onClick={() => { setSearch(""); setQuery(""); setPage(1); }}
                    className="rounded-lg border border-[#dbe5ea] px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                    Clear
                  </button>
                )}
              </form>

              {invLoading ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading inventory…</div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No products found.</div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="space-y-2.5 md:hidden">
                    {rows.map((row, idx) => (
                      <div key={`${row.sku}-${idx}`} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] p-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-medium text-[#3b8da1]">{row.sku}</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-800">{row.product}</p>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{row.category} · {row.brand}</span>
                          <span className="font-semibold text-slate-800">Stock: {row.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="border-y border-[#e5edf1] bg-[#f8fbfc] text-[10px] uppercase tracking-[0.08em] text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">SKU</th>
                          <th className="px-3 py-2.5 font-semibold">Product Name</th>
                          <th className="px-3 py-2.5 font-semibold">Category</th>
                          <th className="px-3 py-2.5 font-semibold">Brand</th>
                          <th className="px-3 py-2.5 font-semibold">Stock</th>
                          <th className="px-3 py-2.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={`${row.sku}-${idx}`} className="border-b border-[#e7edf1] text-slate-700 hover:bg-[#f8fbfc]">
                            <td className="px-3 py-3 font-medium text-[#3b8da1]">{row.sku}</td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{row.product}</td>
                            <td className="px-3 py-3 text-slate-500">{row.category}</td>
                            <td className="px-3 py-3 text-slate-500">{row.brand}</td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{row.stock}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                      <span className="text-xs">{total} products · page {page} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                          className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">
                          Previous
                        </button>
                        <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                          className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`rounded-xl border border-[#dbe5ea] ${bg} p-3 sm:p-4`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>
    </div>
  );
}
