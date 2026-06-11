"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Square, Star, Store, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily",   label: "Daily"   },
  { value: "weekly",  label: "Weekly"  },
  { value: "monthly", label: "Monthly" },
  { value: "yearly",  label: "Yearly"  },
];

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

type ChartPoint = { label: string; value: number };

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
  periodLabel: string;
  metrics: MetricData | null;
  revenueBars: ChartPoint[];
  visitsLine: ChartPoint[];
  products: ProductRow[];
};

type ReviewItem = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

type ReviewsPayload = {
  reviews: ReviewItem[];
  avg: number;
  total: number;
  breakdown: Record<string, number>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <p className={`mt-3 text-sm font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {positive ? "↑" : "↓"} {Math.abs(value)}%
    </p>
  );
}

function StarRow({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function RevenueBarsChart({ points }: { points: ChartPoint[] }) {
  const maxValue = Math.max(...points.map(p => p.value), 1);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {points.map(p => (
        <div key={p.label} className="flex h-full flex-col items-center justify-end gap-1">
          <div
            title={`${p.label}: ${formatCurrency(p.value)}`}
            className="w-5 rounded-t-full bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-[0_8px_14px_rgba(16,185,129,0.2)]"
            style={{ height: `${Math.max(8, (p.value / maxValue) * 100)}%` }}
          />
          <span className="text-[10px] font-medium text-slate-400">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function VisitsSparkline({ points }: { points: ChartPoint[] }) {
  const maxValue = Math.max(...points.map(p => p.value), 1);
  const pts = points.map((p, i) => {
    const x = points.length === 1 ? 0 : (i / (points.length - 1)) * 100;
    const y = 100 - (p.value / maxValue) * 100;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 text-[#65bbc5]" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={pts.join(" ")} />
    </svg>
  );
}

function ConversionDonut({ value }: { value: number }) {
  const deg = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#65bbc5 0 ${deg}deg,#e5e7eb ${deg}deg 360deg)` }} />
      <div className="absolute inset-3 rounded-full bg-white" />
    </div>
  );
}

// ─── Metric cards ─────────────────────────────────────────────────────────────

function MetricsCards({ metrics, revenueBars, visitsLine }: { metrics: MetricData; revenueBars: ChartPoint[]; visitsLine: ChartPoint[] }) {
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
            <p className="mt-2 text-xs text-slate-400">{metrics.unitsSold} units from tracked product views</p>
          </div>
          <ConversionDonut value={metrics.conversionRate} />
        </div>
      </div>
    </div>
  );
}

// ─── Product table ────────────────────────────────────────────────────────────

function ProductPerformanceTable({ products }: { products: ProductRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? products : products.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 px-5 py-6 sm:px-7">
        <h3 className="text-2xl font-bold text-slate-900">Product Performance</h3>
        <button
          type="button"
          onClick={() => setShowAll(p => !p)}
          className="inline-flex items-center justify-center rounded-xl bg-[#65bbc5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
        >
          {showAll ? "Show Less" : "Show All Products"}
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
            {visible.length === 0 ? (
              <tr><td colSpan={7} className="px-7 py-10 text-center text-sm text-slate-500">No products listed yet.</td></tr>
            ) : visible.map(row => (
              <tr key={row.productId} className="text-sm text-slate-700">
                <td className="px-7 py-4">
                  {row.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={row.image} alt={row.name} className="h-12 w-12 rounded-lg object-cover" />
                    : <div className="h-12 w-12 rounded-lg bg-slate-200" />}
                </td>
                <td className="px-7 py-4">
                  <p className="font-semibold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.sku || `${row.stock} in stock`}</p>
                </td>
                <td className="px-7 py-4 text-slate-500">{formatCurrency(row.price)}</td>
                <td className="px-7 py-4 font-semibold">{row.sales}</td>
                <td className="px-7 py-4 font-semibold">{row.engagements}</td>
                <td className={`px-7 py-4 font-semibold ${row.conversions > 0 ? "text-emerald-500" : "text-slate-400"}`}>{row.conversions}%</td>
                <td className="px-7 py-4 font-semibold">{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reviews section ──────────────────────────────────────────────────────────

function StoreReviewsSection() {
  const [data, setData]       = useState<ReviewsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/owner/reviews")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/owner/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev;
          const reviews = prev.reviews.filter(r => r.id !== id);
          const total   = reviews.length;
          const avg     = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
          const breakdown: Record<string, number> = { "5":0,"4":0,"3":0,"2":0,"1":0 };
          reviews.forEach(r => { const k = String(r.rating); if (k in breakdown) breakdown[k]++; });
          return { reviews, avg: Math.round(avg * 10) / 10, total, breakdown };
        });
      }
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        Loading reviews…
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Store Reviews</h3>
          <p className="mt-1 text-sm text-slate-500">Deleted reviews are permanently removed and won't appear to customers.</p>
        </div>

        {data.total > 0 && (
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <p className="text-4xl font-bold text-slate-900">{data.avg}</p>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <StarRow value={data.avg} size="md" />
              <p className="text-xs text-slate-400">{data.total} review{data.total !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rating breakdown */}
      {data.total > 0 && (
        <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="max-w-xs space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = Number(data.breakdown[star] ?? 0);
              const pct   = data.total ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex w-12 shrink-0 items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-slate-500">{star}</span>
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="divide-y divide-slate-100">
        {data.reviews.length === 0 ? (
          <p className="px-7 py-10 text-center text-sm text-slate-400">No reviews yet.</p>
        ) : data.reviews.map(review => (
          <div key={review.id} className="flex items-start gap-3 px-5 py-4 sm:px-7">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
              {review.userName.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-slate-800">{review.userName}</span>
                <StarRow value={review.rating} />
                <span className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {review.text && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{review.text}</p>
              )}
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(review.id)}
              disabled={deleting === review.id}
              title="Delete review"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              {deleting === review.id
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerPerformancePage() {
  const [period,  setPeriod]  = useState<Period>("monthly");
  const [data,    setData]    = useState<PerformancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/owner/performance?period=${period}`)
      .then(async r => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || "Failed to load performance data");
        return payload as PerformancePayload;
      })
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load performance data"))
      .finally(() => setLoading(false));
  }, [period]);

  const metrics = useMemo(
    () => data?.metrics ?? { revenue: 0, revenueChange: 0, visits: 0, visitsChange: 0, conversionRate: 0, conversionChange: 0, orders: 0, unitsSold: 0 },
    [data],
  );

  const periodLabel = data?.periodLabel ?? PERIODS.find(p => p.value === period)?.label ?? "This Period";

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

        {/* Period selector */}
        <div className="relative self-start sm:self-auto">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-teal-400"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
      </section>

      {loading ? (
        <section className="mt-4 rounded-2xl bg-white p-12 text-center text-sm text-slate-400">
          Loading performance…
        </section>
      ) : error ? (
        <section className="mt-4 rounded-2xl border border-red-100 bg-white p-12 text-center text-sm text-red-500">{error}</section>
      ) : (
        <>
          <section data-tutorial-id="owner-performance-section" className="mt-3">
            <MetricsCards metrics={metrics} revenueBars={data?.revenueBars ?? []} visitsLine={data?.visitsLine ?? []} />
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
              <p className="text-sm text-slate-500">Orders {periodLabel}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.orders.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
              <p className="text-sm text-slate-500">Units Sold {periodLabel}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.unitsSold.toLocaleString()}</p>
            </div>
          </section>

          <section className="mt-4">
            <ProductPerformanceTable products={data?.products ?? []} />
          </section>
        </>
      )}

      {/* Reviews — always visible regardless of period loading state */}
      <StoreReviewsSection />
    </>
  );
}
