"use client";

import { useEffect, useState } from "react";
import { Building2, Shield } from "lucide-react";

type TaxRateEntry = { name: string; rate: number };
type TaxRates = Record<string, TaxRateEntry>;

export default function TaxPricingPage() {
  const [taxRates, setTaxRates] = useState<TaxRates>({});
  const [markupPercent, setMarkupPercent] = useState("20");
  const [discountCap, setDiscountCap] = useState("20");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/pricing-rules")
      .then((r) => r.json())
      .then((data) => {
        setTaxRates(data.taxRates ?? {});
        setMarkupPercent(String(data.markupPercent ?? 20));
        setDiscountCap(String(data.discountCap ?? 20));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTaxChange = (code: string, value: string) => {
    const rate = parseFloat(value);
    if (isNaN(rate) && value !== "") return;
    setTaxRates((prev) => ({
      ...prev,
      [code]: { ...prev[code], rate: isNaN(rate) ? 0 : Math.max(0, Math.min(30, rate)) },
    }));
  };

  async function handleSaveTaxRates() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxRates }),
      });
      setSaveMsg(res.ok ? "Tax rates saved." : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePricingRules() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markupPercent: parseFloat(markupPercent) || 0,
          discountCap: parseFloat(discountCap) || 0,
        }),
      });
      setSaveMsg(res.ok ? "Pricing rules saved." : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const stateEntries = Object.entries(taxRates).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Global Tax Engine */}
      <div className="rounded-xl md:rounded-[26px] border border-slate-200 bg-white px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-6">
        <div className="mb-5 flex items-center gap-3">
          <Building2 size={24} className="text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Global Tax Engine</h2>
        </div>

        <p className="mb-4 text-xs text-slate-500">
          Tax rates are applied to orders based on the customer's shipping state.
        </p>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
            {stateEntries.map(([code, entry]) => (
              <div
                key={code}
                className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800">{entry.name}</span>
                  <span className="ml-1.5 text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                    {code}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="30"
                    value={entry.rate}
                    onChange={(e) => handleTaxChange(code, e.target.value)}
                    className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-[#6FAFB3]"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {saveMsg && <p className="mt-2 text-xs text-teal-600">{saveMsg}</p>}

        <button
          onClick={handleSaveTaxRates}
          disabled={saving || loading}
          className="mt-4 w-full rounded-lg bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Tax Rates"}
        </button>
      </div>

      {/* Pricing & Margin Guardrails */}
      <div className="rounded-xl md:rounded-[26px] border border-slate-200 bg-white px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-6">
        <div className="mb-5 flex items-center gap-3">
          <Shield size={24} className="text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Pricing & Margin Guardrails</h2>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
          <p className="text-xs text-amber-800 font-medium">
            These limits apply <strong>platform-wide</strong> to all stores. Store owners can set a selling price up to <strong>original price + markup%</strong> and a discount up to the <strong>discount cap</strong>.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-1.5">
              Maximum Markup %
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Store owners can price up to this % above the original catalog price.
              e.g. 20% markup on a $100 product → max selling price $120.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="500"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
              />
              <span className="text-sm font-medium text-slate-600 flex-shrink-0">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-1.5">
              Maximum Discount Cap %
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Store owners cannot offer a discount greater than this percentage.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={discountCap}
                onChange={(e) => setDiscountCap(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
              />
              <span className="text-sm font-medium text-slate-600 flex-shrink-0">%</span>
            </div>
          </div>
        </div>

        {saveMsg && <p className="mt-4 text-xs text-teal-600">{saveMsg}</p>}

        <button
          onClick={handleSavePricingRules}
          disabled={saving || loading}
          className="mt-6 w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Pricing Rules"}
        </button>
      </div>
    </div>
  );
}
