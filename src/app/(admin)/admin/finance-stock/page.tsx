"use client";

import { useEffect, useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

type RevenuePoint = { state: string; value: string; barHeight: number };
type StoreRevenue = { name: string; sales: string; amount: string; trend: string; positive: boolean };

type InventoryRow = {
  sku: string;
  product: string;
  category: string;
  brand: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

const revenueByState: RevenuePoint[] = [
  { state: "CA", value: "12.4M", barHeight: 42 },
  { state: "TX", value: "10.1M", barHeight: 38 },
  { state: "NY", value: "9.2M", barHeight: 34 },
  { state: "FL", value: "7.8M", barHeight: 30 },
  { state: "WA", value: "6.4M", barHeight: 26 },
  { state: "IL", value: "5.8M", barHeight: 22 },
  { state: "PA", value: "5.3M", barHeight: 18 },
  { state: "GA", value: "4.2M", barHeight: 14 },
];

const storeRevenues: StoreRevenue[] = [
  { name: "Spice Merchant", sales: "428 Sales", amount: "$82,400", trend: "+2.4%", positive: true },
  { name: "Urban Tech", sales: "372 Sales", amount: "$54,200", trend: "-4.2%", positive: false },
  { name: "Velvet & Vine", sales: "285 Sales", amount: "$41,900", trend: "+8.1%", positive: true },
  { name: "Atlas Outdoors", sales: "198 Sales", amount: "$29,500", trend: "-1.7%", positive: false },
];

function statusClass(status: InventoryRow["status"]) {
  if (status === "In Stock") return "bg-[#d7f3f0] text-[#0f766e]";
  if (status === "Low Stock") return "bg-[#ffe8d8] text-[#c05621]";
  return "bg-[#ffe2e2] text-[#c53030]";
}

const PAGE_SIZE = 20;

export default function AdminFinanceStockPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
    if (query) params.set("q", query);

    fetch(`/api/admin/finance-stock/inventory?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setLastSync(new Date().toLocaleTimeString());
      })
      .catch(() => setError("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [page, query]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/finance-stock" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar searchPlaceholder="Search financials or stock..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:pb-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">Revenue & Inventory Monitoring</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">Real-time financial performance and stock logistics oversight.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#dbe5ea] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:text-sm">
                  Last 30 Days <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6bbdc7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5baeb8] sm:w-auto sm:text-sm">
                  <Download className="h-4 w-4" /> Export Report
                </button>
              </div>
            </div>

            {/* Revenue charts (static) */}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">Revenue by State</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total USD (M)</p>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex h-[140px] min-w-[280px] items-end justify-between gap-1.5 border-b border-[#e5edf1] pb-4 sm:gap-2 sm:min-w-[420px] sm:h-[160px]">
                    {revenueByState.map((point) => (
                      <div key={point.state} className="flex min-w-[28px] flex-1 flex-col items-center gap-1.5 sm:min-w-[36px] sm:gap-2">
                        <span className="text-[9px] font-semibold text-[#2f8ea3] sm:text-[10px]">{point.value}</span>
                        <div className="w-5 rounded-t-md bg-gradient-to-t from-[#6bbdc7] to-[#8fd1d8] sm:w-7" style={{ height: `${point.barHeight * 0.85}px` }} />
                        <span className="text-[9px] font-medium text-slate-600 sm:text-[10px]">{point.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <h2 className="mb-4 text-sm font-bold text-slate-800 sm:text-base">Store-wise Revenue</h2>
                <div className="space-y-2">
                  {storeRevenues.map((store) => (
                    <div key={store.name} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 sm:text-sm">{store.name}</p>
                          <p className="text-[10px] text-slate-500">{store.sales}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-bold text-slate-800 sm:text-sm">{store.amount}</p>
                          <p className={`text-[10px] font-semibold ${store.positive ? "text-emerald-600" : "text-rose-600"}`}>{store.trend}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* Master Inventory Monitor — live data */}
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

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, SKU, category or brand…"
                  className="w-full rounded-lg border border-[#dbe5ea] px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6bbdc7]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#6bbdc7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5baeb8]"
                >
                  Search
                </button>
                {query && (
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setQuery(""); setPage(1); }}
                    className="rounded-lg border border-[#dbe5ea] px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
              </form>

              {error && (
                <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading inventory…</div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No products found.</div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="space-y-2.5 md:hidden">
                    {rows.map((row) => (
                      <div key={row.sku} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] p-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-medium text-[#3b8da1]">{row.sku}</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-800">{row.product}</p>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </div>
                        <p className="mb-1.5 text-[11px] text-slate-400">Store Location: —</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Stock:</span>
                          <span className="font-semibold text-slate-800">{row.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="border-y border-[#e5edf1] bg-[#f8fbfc] text-[10px] uppercase tracking-[0.08em] text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">SKU ID</th>
                          <th className="px-3 py-2.5 font-semibold">Product Name</th>
                          <th className="px-3 py-2.5 font-semibold">Store Location</th>
                          <th className="px-3 py-2.5 font-semibold">Current Stock</th>
                          <th className="px-3 py-2.5 font-semibold">Inventory Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.sku} className="border-b border-[#e7edf1] text-slate-700 hover:bg-[#f8fbfc]">
                            <td className="px-3 py-3 font-medium text-[#3b8da1]">{row.sku}</td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{row.product}</td>
                            <td className="px-3 py-3 text-slate-400">—</td>
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                      <span className="text-xs">{total} products · page {page} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => p - 1)}
                          className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40"
                        >
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
