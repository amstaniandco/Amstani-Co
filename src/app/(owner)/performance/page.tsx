"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Store, Square } from "lucide-react";

type MetricData = {
  revenue: number;
  revenueChange: number;
  visits: number;
  visitsChange: number;
  conversionRate: number;
  conversionChange: number;
  orders: number;
  unitsSold: number;
};

type ChartPoint = {
  label: string;
  value: number;
};

type ProductRow = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  image?: string | null;
  stock: number;
  sales: number;
  revenue: number;
  engagements: number;
  conversions: number;
};

type PerformancePayload = {
  storeName: string;
  metrics: MetricData | null;
  revenueBars: ChartPoint[];
  visitsLine: ChartPoint[];
  products: ProductRow[];
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <p className={`mt-3 text-sm font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {positive ? "up" : "down"} {Math.abs(value)}%
    </p>
  );
}

function RevenueBarsChart({ points }: { points: ChartPoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {points.map((point) => (
        <div key={point.label} className="flex h-full flex-col items-center justify-end gap-1">
          <div
            title={`${point.label}: ${formatCurrency(point.value)}`}
            className="w-5 rounded-t-full bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-[0_8px_14px_rgba(16,185,129,0.2)]"
            style={{ height: `${Math.max(8, (point.value / maxValue) * 100)}%` }}
          />
          <span className="text-[10px] font-medium text-slate-400">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function VisitsSparkline({ points }: { points: ChartPoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const linePoints = points.map((point, index) => {
    const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
    const y = 100 - (point.value / maxValue) * 100;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 text-[#65bbc5]" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints.join(" ")}
      />
    </svg>
  );
}

function ConversionDonut({ value }: { value: number }) {
  const degrees = Math.max(0, Math.min(100, value)) * 3.6;

  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#65bbc5 0 ${degrees}deg,#e5e7eb ${degrees}deg 360deg)` }} />
      <div className="absolute inset-3 rounded-full bg-white" />
    </div>
  );
}

function MetricsCards({
  metrics,
  revenueBars,
  visitsLine,
}: {
  metrics: MetricData;
  revenueBars: ChartPoint[];
  visitsLine: ChartPoint[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{formatCurrency(metrics.revenue)}</p>
            <Trend value={metrics.revenueChange} />
          </div>
          <RevenueBarsChart points={revenueBars} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Store Visits</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{metrics.visits.toLocaleString()}</p>
            <Trend value={metrics.visitsChange} />
          </div>
          <VisitsSparkline points={visitsLine} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Conversion Rate</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{metrics.conversionRate}%</p>
            <Trend value={metrics.conversionChange} />
            <p className="mt-2 text-xs text-slate-400">
              {metrics.unitsSold} units from tracked product views
            </p>
          </div>
          <ConversionDonut value={metrics.conversionRate} />
        </div>
      </div>
    </div>
  );
}

function ProductPerformanceTable({ products }: { products: ProductRow[] }) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const visibleProducts = showAllProducts ? products : products.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 px-5 py-6 sm:px-7">
        <h3 className="text-2xl font-bold text-slate-900">Product Performance</h3>
        <button
          type="button"
          onClick={() => setShowAllProducts((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl bg-[#65bbc5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
        >
          {showAllProducts ? "Show Less" : "Show All Products"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left">
          <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
            <tr>
              <th className="px-7 pb-4">Image</th>
              <th className="px-7 pb-4">Name</th>
              <th className="px-7 pb-4">Price</th>
              <th className="px-7 pb-4">Sales</th>
              <th className="px-7 pb-4">Views</th>
              <th className="px-7 pb-4">Conversion</th>
              <th className="px-7 pb-4">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-7 py-10 text-center text-sm text-slate-500">
                  No products listed yet.
                </td>
              </tr>
            ) : (
              visibleProducts.map((row) => (
                <tr key={row.productId} className="text-sm text-slate-700">
                  <td className="px-7 py-4">
                    {row.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.image} alt={row.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-200" />
                    )}
                  </td>
                  <td className="px-7 py-4">
                    <p className="font-semibold text-slate-800">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.sku || `${row.stock} in stock`}</p>
                  </td>
                  <td className="px-7 py-4 text-slate-500">{formatCurrency(row.price)}</td>
                  <td className="px-7 py-4 font-semibold">{row.sales}</td>
                  <td className="px-7 py-4 font-semibold">{row.engagements}</td>
                  <td className={`px-7 py-4 font-semibold ${row.conversions > 0 ? "text-emerald-500" : "text-slate-400"}`}>
                    {row.conversions}%
                  </td>
                  <td className="px-7 py-4 font-semibold">{formatCurrency(row.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OwnerPerformancePage() {
  const [data, setData] = useState<PerformancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/owner/performance")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Failed to load performance data");
        return payload as PerformancePayload;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load performance data"))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(
    () => data?.metrics ?? { revenue: 0, revenueChange: 0, visits: 0, visitsChange: 0, conversionRate: 0, conversionChange: 0, orders: 0, unitsSold: 0 },
    [data],
  );

  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{data?.storeName ?? "My Store"}</h1>
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
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2.15rem]">Store Performance</h2>
          <p className="mt-1 text-sm text-slate-500">Live analytics from orders, store visits, and product views.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 self-start rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 sm:self-auto"
        >
          Monthly
          <ChevronDown className="h-4 w-4" />
        </button>
      </section>

      {loading ? (
        <section className="mt-4 rounded-2xl bg-white p-12 text-center text-sm text-slate-400">Loading performance...</section>
      ) : error ? (
        <section className="mt-4 rounded-2xl border border-red-100 bg-white p-12 text-center text-sm text-red-500">{error}</section>
      ) : (
        <>
          <section className="mt-3">
            <MetricsCards metrics={metrics} revenueBars={data?.revenueBars ?? []} visitsLine={data?.visitsLine ?? []} />
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
              <p className="text-sm text-slate-500">Orders This Month</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.orders.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
              <p className="text-sm text-slate-500">Units Sold This Month</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.unitsSold.toLocaleString()}</p>
            </div>
          </section>

          <section className="mt-4">
            <ProductPerformanceTable products={data?.products ?? []} />
          </section>
        </>
      )}
    </>
  );
}
