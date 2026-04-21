"use client";

import { useState } from "react";
import { ChevronDown, Shield } from "lucide-react";

export default function PricingMarginGuardrails() {
  const [selectedState, setSelectedState] = useState("New York");
  const [minimumMarkup, setMinimumMarkup] = useState("20");
  const [discountCap, setDiscountCap] = useState("20");

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <div className="rounded-xl border border-[#cfd8df] bg-white p-4 shadow-sm md:rounded-[16px] md:p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
        <Shield className="h-4 w-4 text-[#69bbc4]" />
        Pricing & Margin Guardrails
      </h2>

      <div className="mt-5">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
          Select State
        </label>
        <div className="relative mt-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-10 w-full appearance-none rounded-md border border-[#e0e6eb] bg-[#f3f6f8] px-3 pr-9 text-sm font-medium text-slate-700 outline-none"
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
            Minimum Markup %
          </label>
          <div className="relative mt-2">
            <input
              type="number"
              value={minimumMarkup}
              onChange={(e) => setMinimumMarkup(e.target.value)}
              className="h-10 w-full rounded-md border border-[#e0e6eb] bg-[#f3f6f8] px-3 pr-7 text-sm font-medium text-slate-700 outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">%</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
            Discount Cap
          </label>
          <div className="relative mt-2">
            <input
              type="number"
              value={discountCap}
              onChange={(e) => setDiscountCap(e.target.value)}
              className="h-10 w-full rounded-md border border-[#e0e6eb] bg-[#f3f6f8] px-3 pr-7 text-sm font-medium text-slate-700 outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-[#68B8C1] px-4 text-sm font-semibold text-white transition hover:bg-[#56a9b2]"
      >
        Save
      </button>
    </div>
  );
}
