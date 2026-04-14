"use client";

import { useState } from "react";

export default function PricingMarginGuardrails() {
  const [minimumMargin, setMinimumMargin] = useState("20");
  const [globalDiscountCap, setGlobalDiscountCap] = useState("20");

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm md:rounded-[26px] md:p-5">
      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Pricing & Margin Guardrails</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 sm:text-sm">
            Minimum Margin %
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={minimumMargin}
              onChange={(e) => setMinimumMargin(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#d8e0e6] bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#58b8c3] focus:outline-none sm:h-11"
            />
            <span className="text-sm font-medium text-slate-600">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 sm:text-sm">
            Global Discount Cap
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={globalDiscountCap}
              onChange={(e) => setGlobalDiscountCap(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#d8e0e6] bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#58b8c3] focus:outline-none sm:h-11"
            />
            <span className="text-sm font-medium text-slate-600">%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#58b8c3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4fa3b0] sm:py-3"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Save & Push to All Stores
      </button>
    </div>
  );
}
