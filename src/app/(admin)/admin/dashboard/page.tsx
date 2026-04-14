import {
  ChevronRight,
} from "lucide-react";
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
};

type LeaderboardRow = {
  rank: string;
  name: string;
  volume: string;
  rating: number;
};

const metrics: Metric[] = [
  {
    label: "Real-time revenue",
    value: "$1.2M",
    note: "vs last month",
    trend: "+12%",
  },
  {
    label: "Total orders",
    value: "45,670",
    note: "Daily throughput",
  },
  {
    label: "Active stores",
    value: "89",
    note: "Across major regions",
  },
  {
    label: "Average order value",
    value: "$65.20",
    note: "Optimizing upsell channels",
  },
];

const storeMetrics: StoreMetric[] = [
  { name: "London Flagship", revenue: "$240k" },
  { name: "New York SOHO", revenue: "$185k" },
  { name: "Tokyo Shibuya", revenue: "$142k" },
  { name: "Berlin Mitte", revenue: "$98k" },
];

const leaderboardRows: LeaderboardRow[] = [
  { rank: "01", name: "London Flagship", volume: "$2.4M", rating: 5 },
  { rank: "02", name: "New York SoHo", volume: "$1.8M", rating: 4 },
  { rank: "03", name: "Tokyo Shibuya", volume: "$1.1M", rating: 5 },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/dashboard" />

        <main>
          <AdminNavbar />

          <div className="mt-4 rounded-3xl border border-[#dbe5eb] bg-white/75 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.07)] sm:p-6">

          <section>
            <h1 className="text-4xl font-bold leading-tight text-[#4ba7b3]">Global Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enterprise performance overview and logistics command center.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-xl border border-[#e2eaee] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{metric.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <p className="text-3xl font-extrabold text-slate-800">{metric.value}</p>
                    {metric.trend ? (
                      <span className="text-xs font-semibold text-emerald-500">{metric.trend}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{metric.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
            <article className="rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
              <h2 className="text-xl font-bold text-slate-800">Regional Revenue Distribution</h2>
              <div className="mt-4">
                <AdminUsMap />
              </div>
            </article>

            <article className="rounded-xl border border-[#dbe6ea] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:p-5">
              <h2 className="text-xl font-bold text-slate-800">Store-wise Revenue Analytics</h2>

              <div className="mt-6 space-y-5">
                {storeMetrics.map((store, index) => (
                  <div key={store.name}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                      <span>{store.name}</span>
                      <span className="font-semibold">{store.revenue}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e5eef1]">
                      <div
                        className="h-2 rounded-full bg-[#4cb3c3]"
                        style={{ width: `${85 - index * 14}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-[#d9e3e8] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f8fbfc]"
              >
                <span>View All Analytics</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>
          </section>

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
                    <th className="px-4 py-3">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardRows.map((row) => (
                    <tr key={row.rank} className="border-t border-[#e5edf1] bg-white text-slate-700">
                      <td className="px-4 py-4 font-bold text-[#2e8a9c]">{row.rank}</td>
                      <td className="px-4 py-4 font-semibold">{row.name}</td>
                      <td className="px-4 py-4">{row.volume}</td>
                      <td className="px-4 py-4 text-amber-500">{"★".repeat(row.rating)}</td>
                    </tr>
                  ))}
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
