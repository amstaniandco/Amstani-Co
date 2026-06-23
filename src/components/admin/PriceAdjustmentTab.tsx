"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, RotateCcw } from "lucide-react";

export default function PriceAdjustmentTab() {
  const [mode, setMode] = useState<"increase" | "decrease">("increase");
  const [pctInput, setPctInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function apply() {
    const pct = parseFloat(pctInput);
    if (isNaN(pct) || pct <= 0) {
      setMsg({ ok: false, text: "Enter a percentage greater than 0." });
      return;
    }
    if (mode === "decrease" && pct >= 100) {
      setMsg({ ok: false, text: "Decrease must be less than 100%." });
      return;
    }
    setApplying(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/global-catalog/compute-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, percent: pct }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Failed to apply." });
        return;
      }
      setMsg({
        ok: true,
        text: `${mode === "increase" ? "Increased" : "Decreased"} ${data.updatedProducts} product prices by ${pct}%.`,
      });
      setPctInput("");
    } finally {
      setApplying(false);
    }
  }

  async function reset() {
    setResetting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/global-catalog/compute-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Failed to reset." });
        return;
      }
      setMsg({
        ok: true,
        text: `Reset ${data.updatedProducts} products to their original prices.`,
      });
      setPctInput("");
    } finally {
      setResetting(false);
    }
  }

  const preview =
    pctInput && parseFloat(pctInput) > 0
      ? mode === "increase"
        ? (100 * (1 + parseFloat(pctInput) / 100)).toFixed(2)
        : (100 * (1 - parseFloat(pctInput) / 100)).toFixed(2)
      : null;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs text-slate-400">
          Apply a single percentage to every product&apos;s base price across
          the catalog.
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Price Adjustment
        </h2>
      </div>

      {/* Feedback */}
      {msg && (
        <div
          className={`mb-4 flex items-start justify-between rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          <span>{msg.text}</span>
          <button
            onClick={() => setMsg(null)}
            className="ml-4 shrink-0 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-800 mb-1">
          Bulk Price Adjustment
        </p>
        <p className="text-xs text-slate-500 mb-5">
          Increase or decrease{" "}
          <span className="font-semibold">all product prices</span> by a
          percentage. The original price is always preserved — use{" "}
          <span className="font-semibold">Reset</span> to restore it.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("increase")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition ${mode === "increase" ? "bg-[#58b8c3] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <TrendingUp className="h-4 w-4" /> Increase
            </button>
            <button
              type="button"
              onClick={() => setMode("decrease")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition ${mode === "decrease" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <TrendingDown className="h-4 w-4" /> Decrease
            </button>
          </div>

          {/* Percentage input */}
          <div className="flex-1 min-w-[140px]">
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={pctInput}
                onChange={(e) => setPctInput(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#58b8c3]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Apply */}
          <button
            onClick={apply}
            disabled={applying || !pctInput}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${mode === "increase" ? "bg-[#58b8c3] hover:bg-[#4aa7b2]" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {applying
              ? "Applying…"
              : `Apply ${mode === "increase" ? "Increase" : "Decrease"}`}
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {resetting ? "Resetting…" : "Reset All"}
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <p className="mt-4 text-xs text-slate-500">
            Preview: a <span className="font-semibold">$100.00</span> product
            becomes{" "}
            <span
              className={`font-bold ${mode === "increase" ? "text-[#2f7f8d]" : "text-amber-600"}`}
            >
              ${preview}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
