import { ChevronDown, Store, Square } from "lucide-react";
import OwnerChatSidebar from "../store/chats/components/OwnerChatSidebar";

type ProductRow = {
  name: string;
  price: string;
  sales: number;
  engagements: number;
  conversions: number;
};

const revenueBars = [52, 86, 71, 95, 62, 78];
const visitsLine = [12, 20, 16, 24, 21, 28, 25, 31];

const productRows: ProductRow[] = [
  { name: "Name Of Product", price: "$51", sales: 467, engagements: 467, conversions: 67 },
  { name: "Name Of Product", price: "$51", sales: 467, engagements: 467, conversions: 37 },
  { name: "Name Of Product", price: "$51", sales: 467, engagements: 467, conversions: 61 },
  { name: "Name Of Product", price: "$51", sales: 467, engagements: 467, conversions: 71 },
  { name: "Name Of Product", price: "$51", sales: 467, engagements: 467, conversions: 12 },
];

function RevenueBarsChart() {
  return (
    <div className="flex h-20 items-end gap-1.5 sm:gap-2">
      {revenueBars.map((height, index) => (
        <div key={index} className="flex h-full items-end">
          <div
            className="w-4 rounded-t-full bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-[0_8px_14px_rgba(16,185,129,0.2)] sm:w-5"
            style={{ height: `${height}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function VisitsSparkline() {
  const maxValue = Math.max(...visitsLine);
  const points = visitsLine.map((value, index) => {
    const x = (index / (visitsLine.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20 text-red-500 sm:h-24 sm:w-24" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
      <polygon points="76,28 92,30 88,16" fill="currentColor" />
    </svg>
  );
}

function ConversionDonut() {
  return (
    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#65bbc5_0_65deg,#e5e7eb_65deg_360deg)]" />
      <div className="absolute inset-3 rounded-full bg-white" />
    </div>
  );
}

function MetricsCards() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-2xl bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">$716M</p>
            <p className="mt-3 text-sm font-medium text-emerald-500">↗ 32%</p>
          </div>
          <RevenueBarsChart />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Store Visits</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">78329</p>
            <p className="mt-3 text-sm font-medium text-red-500">↘ 12%</p>
          </div>
          <VisitsSparkline />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Conversion</p>
            <p className="text-sm text-slate-500">Rate</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">18%</p>
            <p className="mt-3 text-sm font-medium text-emerald-500">↗ 2%</p>
          </div>
          <ConversionDonut />
        </div>
      </div>
    </div>
  );
}

function ProductPerformanceTable() {
  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <h3 className="text-2xl font-bold text-slate-900">Product Performance</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[72px_1.6fr_0.7fr_0.8fr_0.9fr_0.9fr] border-b border-slate-100 px-7 pb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
            <div>Image</div>
            <div>Name</div>
            <div>Price</div>
            <div>Sales</div>
            <div>Engagements</div>
            <div>Conversions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {productRows.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="grid grid-cols-[72px_1.6fr_0.7fr_0.8fr_0.9fr_0.9fr] items-center px-7 py-4 text-sm"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-slate-200 sm:h-12 sm:w-12" />
                </div>
                <div className="font-semibold text-slate-700">{row.name}</div>
                <div className="text-slate-500">{row.price}</div>
                <div className="font-semibold text-slate-700">{row.sales}</div>
                <div className="font-semibold text-slate-700">{row.engagements}</div>
                <div className={`font-semibold ${row.conversions >= 60 ? "text-emerald-500" : "text-red-500"}`}>
                  {row.conversions}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerPerformancePage() {
  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Performance" />

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

          <section className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2.15rem]">Store Performance</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 self-start rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 sm:self-auto"
            >
              Monthly
              <ChevronDown className="h-4 w-4" />
            </button>
          </section>

          <section className="mt-3">
            <MetricsCards />
          </section>

          <section className="mt-4">
            <ProductPerformanceTable />
          </section>
        </main>
      </div>
    </div>
  );
}
