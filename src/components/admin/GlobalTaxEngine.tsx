"use client";

import { useState } from "react";

interface TaxRate {
  state: string;
  code: string;
  rate: number;
}

const TAX_RATES: TaxRate[] = [
  { state: "California", code: "CA", rate: 8.25 },
  { state: "New York", code: "NY", rate: 8.875 },
  { state: "Texas", code: "TX", rate: 6.25 },
];

export default function GlobalTaxEngine() {
  const [applyFederally, setApplyFederally] = useState(true);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm md:rounded-[26px] md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Global Tax Engine</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">Apply Federally</span>
          <button
            onClick={() => setApplyFederally(!applyFederally)}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              applyFederally ? "bg-[#58b8c3]" : "bg-[#c7d2d9]"
            }`}
            aria-label="Apply Federally toggle"
          >
            <span
              className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                applyFederally ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {TAX_RATES.map((tax) => (
          <div key={tax.code} className="flex items-center justify-between gap-3 rounded-lg border border-[#e7edf1] bg-[#f8fafb] px-3 py-3 sm:px-4 sm:py-3.5">
            <span className="text-sm font-medium text-slate-800 sm:text-base">{tax.state} ({tax.code})</span>
            <span className="text-sm font-semibold text-slate-700">
              {tax.rate}
              <span className="text-xs text-slate-600"> %</span>
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-[#d8e0e6] bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f8fafb] sm:py-3"
      >
        View All States
      </button>
    </div>
  );
}
