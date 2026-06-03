"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import AdminUsMap from "../../../../components/admin/AdminUsMap";

type Metric = {
  label: string;
  value: string;
  note: string;
  trend?: string;
};

type StoreMetric = {
  name: string;
  revenue: string;
  percentage: number;
};

type LeaderboardRow = {
  rank: string;
  name: string;
  volume: string;
  orderCount: number;
};

type LatestStore = {
  _id: string;
  name: string;
  status: "pending" | "active" | "suspended";
  logoUrl?: string;
  createdAt: string;
  owner?: { name: string; email: string };
};

type StateRevenueEntry = { revenue: number; formatted: string; orderCount: number };

type DashboardData = {
  metrics: Metric[];
  storeMetrics: StoreMetric[];
  leaderboard: LeaderboardRow[];
  latestStores: LatestStore[];
  stateRevenueMap: Record<string, StateRevenueEntry>;
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-600",
};

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className ?? ""}`} />;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState<string>("");
  const stateRevenueMap = data?.stateRevenueMap ?? {};

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load dashboard");
        }
        return r.json();
      })
      .then((d: DashboardData) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStateSelect(state: string) {
    setSelectedState((prev) => prev === state ? "" : state);
  }

  const metrics = data?.metrics ?? [];
  const storeMetrics = data?.storeMetrics ?? [];
  const leaderboard = data?.leaderboard ?? [];
  const latestStores = data?.latestStores ?? [];

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/dashboard" />

        <main>
          <AdminNavbar />

          <div className="mt-4 rounded-3xl border border-[#dbe5eb] bg-white/75 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.07)] sm:p-6">

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Header + Metric Cards */}
            <section>
              <h1 className="text-4xl font-bold leading-tight text-[#4ba7b3]">Global Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enterprise performance overview and logistics command center.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-[#e2eaee] bg-white p-4">
                        <SkeletonBlock className="h-2 w-24" />
                        <SkeletonBlock className="mt-4 h-8 w-28" />
                        <SkeletonBlock className="mt-2 h-2 w-32" />
                      </div>
                    ))
                  : metrics.map((metric) => (
                      <article
                        key={metric.label}
                        className="rounded-xl border border-[#e2eaee] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
                      >
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                          {metric.label}
                        </p>
                        <div className="mt-2 flex items-end justify-between gap-2">
                          <p className="text-3xl font-extrabold text-slate-800">{metric.value}</p>
                          {metric.trend && (
                            <span className="text-xs font-semibold text-emerald-500">
                              {metric.trend}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{metric.note}</p>
                      </article>
                    ))}
              </div>
            </section>

            {/* Map + Store Revenue */}
            <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
              <article className="rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-slate-800">Regional Revenue Distribution</h2>
                  {selectedState && (
                    <button
                      onClick={() => setSelectedState("")}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Clear · {selectedState}
                    </button>
                  )}
                </div>
                <div className="mt-4">
                  <AdminUsMap
                    selectedState={selectedState}
                    onStateSelect={handleStateSelect}
                    stateRevenueMap={stateRevenueMap}
                  />
                </div>
              </article>

              <article className="rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
                <h2 className="text-xl font-bold text-slate-800">Store-wise Revenue Analytics</h2>

                {loading ? (
                  <div className="mt-6 space-y-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <SkeletonBlock className="mb-2 h-4 w-40" />
                        <div className="h-2 rounded-full bg-[#e5eef1]" />
                      </div>
                    ))}
                  </div>
                ) : storeMetrics.length === 0 ? (
                  <p className="mt-6 text-sm text-slate-400">
                    No revenue data yet. Revenue will appear here once orders are paid.
                  </p>
                ) : (
                  <div className="mt-6 space-y-5">
                    {storeMetrics.map((store) => (
                      <div key={store.name}>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                          <span>{store.name}</span>
                          <span className="font-semibold">{store.revenue}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#e5eef1]">
                          <div
                            className="h-2 rounded-full bg-[#4cb3c3]"
                            style={{ width: `${store.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-[#d9e3e8] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f8fbfc]"
                >
                  <span>View All Analytics</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            </section>

            {/* Leaderboard */}
            <section className="mt-6 rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Top Performing Stores</h2>
                <button type="button" className="text-sm font-semibold text-[#338ca0] hover:underline">
                  View Leaderboard
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#dbe6ea]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f3f8fa] text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Store name</th>
                      <th className="px-4 py-3">Sales volume</th>
                      <th className="px-4 py-3">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-t border-[#e5edf1] bg-white">
                          <td colSpan={4} className="px-4 py-4">
                            <SkeletonBlock className="h-4 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                          No data yet. Stores will appear here once paid orders are placed.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((row) => (
                        <tr key={row.rank} className="border-t border-[#e5edf1] bg-white text-slate-700">
                          <td className="px-4 py-4 font-bold text-[#2e8a9c]">{row.rank}</td>
                          <td className="px-4 py-4 font-semibold">{row.name}</td>
                          <td className="px-4 py-4">{row.volume}</td>
                          <td className="px-4 py-4 text-slate-500">{row.orderCount} orders</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Latest Stores */}
            <section className="mt-6 rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Latest Stores</h2>
                <a
                  href="/admin/stores"
                  className="text-sm font-semibold text-[#338ca0] hover:underline"
                >
                  View All
                </a>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#dbe6ea]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f3f8fa] text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Store</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-t border-[#e5edf1] bg-white">
                          <td colSpan={4} className="px-4 py-4">
                            <SkeletonBlock className="h-4 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : latestStores.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                          No stores registered yet. Stores created by owners will appear here.
                        </td>
                      </tr>
                    ) : (
                      latestStores.map((store) => (
                        <tr key={String(store._id)} className="border-t border-[#e5edf1] bg-white text-slate-700">
                          <td className="px-4 py-4 font-semibold">{store.name}</td>
                          <td className="px-4 py-4 text-slate-500">
                            {store.owner?.name ?? "—"}
                            {store.owner?.email && (
                              <span className="block text-xs text-slate-400">{store.owner.email}</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[store.status] ?? ""}`}
                            >
                              {store.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-400">
                            {store.createdAt
                              ? new Date(store.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
