"use client";

import { useState } from "react";
import { Building2, Shield } from "lucide-react";

interface TaxRate {
  state: string;
  rate: number;
}

interface PricingRule {
  state: string;
  minimumMarkup: number;
  discountCap: number;
}

export default function TaxPricingPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { state: "California (CA)", rate: 8.25 },
    { state: "New York (NY)", rate: 8.875 },
    { state: "Texas (TX)", rate: 6.25 },
  ]);

  const [selectedState, setSelectedState] = useState("New York");
  const [minimumMarkup, setMinimumMarkup] = useState("20");
  const [discountCap, setDiscountCap] = useState("20");

  const handleTaxRateChange = (index: number, newRate: number) => {
    const updatedRates = [...taxRates];
    updatedRates[index].rate = newRate;
    setTaxRates(updatedRates);
  };

  const handleSave = () => {
    console.log("Saved tax rates:", taxRates);
    console.log("Saved pricing rules:", {
      state: selectedState,
      minimumMarkup,
      discountCap,
    });
  };

  const allStates = [
    "New York",
    "California",
    "Texas",
    "Florida",
    "Illinois",
    "Pennsylvania",
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Global Tax Engine */}
      <div className="rounded-xl md:rounded-[26px] border border-slate-200 bg-white px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-6">
        <div className="mb-5 flex items-center gap-3">
          <Building2 size={24} className="text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Global Tax Engine</h2>
        </div>

        <div className="space-y-3">
          {taxRates.map((tax, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">
                {tax.state}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={tax.rate}
                  onChange={(e) => handleTaxRateChange(index, parseFloat(e.target.value) || 0)}
                  className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
                />
                <span className="text-xs text-slate-600">%</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="mt-4 w-full rounded-lg bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]"
        >
          Save Tax Rates
        </button>
        
        <button className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          View All States
        </button>
      </div>

      {/* Pricing & Margin Guardrails */}
      <div className="rounded-xl md:rounded-[26px] border border-slate-200 bg-white px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-6">
        <div className="mb-5 flex items-center gap-3">
          <Shield size={24} className="text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Pricing & Margin Guardrails
          </h2>
        </div>

        <div className="space-y-4">
          {/* State Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
            >
              {allStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Markup & Discount Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">
                Minimum Markup %
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={minimumMarkup}
                  onChange={(e) => setMinimumMarkup(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
                />
                <span className="ml-2 text-sm font-medium text-slate-600">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">
                Discount Cap
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={discountCap}
                  onChange={(e) => setDiscountCap(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
                />
                <span className="ml-2 text-sm font-medium text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
