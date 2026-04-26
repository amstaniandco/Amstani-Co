"use client";

import { useState } from "react";
import { ChevronDown, Store, Square } from "lucide-react";

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
  { name: "Classic Linen Shirt", price: "$51", sales: 467, engagements: 467, conversions: 67 },
  { name: "Urban Fit Chino", price: "$74", sales: 392, engagements: 441, conversions: 37 },
  { name: "Silk Blend Kurta", price: "$89", sales: 501, engagements: 589, conversions: 61 },
  { name: "Heritage Denim Jacket", price: "$120", sales: 318, engagements: 472, conversions: 71 },
  { name: "Premium Cotton Polo", price: "$44", sales: 455, engagements: 498, conversions: 12 },
  { name: "Monogram Tee", price: "$38", sales: 578, engagements: 640, conversions: 74 },
  { name: "Signature Waistcoat", price: "$112", sales: 206, engagements: 355, conversions: 58 },
  { name: "Textured Blazer", price: "$158", sales: 194, engagements: 302, conversions: 42 },
  { name: "Tailored Formal Trouser", price: "$69", sales: 362, engagements: 410, conversions: 66 },
  { name: "Lightweight Bomber", price: "$96", sales: 281, engagements: 390, conversions: 55 },
  { name: "Essential Hoodie", price: "$62", sales: 431, engagements: 530, conversions: 64 },
  { name: "Relaxed Cargo Pants", price: "$82", sales: 244, engagements: 365, conversions: 49 },
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
  const [showAllProducts, setShowAllProducts] = useState(false);

  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 px-5 py-6 sm:px-7 sm:py-8">
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
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[72px_1.6fr_0.7fr_0.8fr_0.9fr_0.9fr] border-b border-slate-100 px-7 pb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
            <div>Image</div>
            <div>Name</div>
            <div>Price</div>
            <div>Sales</div>
            <div>Engagements</div>
            <div>Conversions</div>
          </div>

          <div className={`${showAllProducts ? "max-h-none" : "max-h-[360px]"} divide-y divide-slate-100 overflow-y-auto`}>
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
    <>
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
    </>
  );
}
