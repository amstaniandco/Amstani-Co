"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSelectedState, subscribeSelectedState } from "../../../../lib/state-preference";

function resolveStateCode(state: string): string {
  if (!state) return "";
  const s = state.trim();
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
  const paren = s.match(/\(([A-Za-z]{2})\)/);
  if (paren) return paren[1].toUpperCase();
  const NAMES: Record<string, string> = {
    alabama:"AL",alaska:"AK",arizona:"AZ",arkansas:"AR",california:"CA",colorado:"CO",
    connecticut:"CT",delaware:"DE",florida:"FL",georgia:"GA",hawaii:"HI",idaho:"ID",
    illinois:"IL",indiana:"IN",iowa:"IA",kansas:"KS",kentucky:"KY",louisiana:"LA",
    maine:"ME",maryland:"MD",massachusetts:"MA",michigan:"MI",minnesota:"MN",
    mississippi:"MS",missouri:"MO",montana:"MT",nebraska:"NE",nevada:"NV",
    "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
    "north carolina":"NC","north dakota":"ND",ohio:"OH",oklahoma:"OK",oregon:"OR",
    pennsylvania:"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",
    tennessee:"TN",texas:"TX",utah:"UT",vermont:"VT",virginia:"VA",washington:"WA",
    "west virginia":"WV",wisconsin:"WI",wyoming:"WY","washington d.c.":"DC",
  };
  return NAMES[s.toLowerCase()] ?? "";
}

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const [selectedState, setSelectedState] = useState("");
  const [taxRates, setTaxRates] = useState<Record<string, { name: string; rate: number }>>({});

  // Read state from localStorage and subscribe to changes
  useEffect(() => {
    setSelectedState(getSelectedState());
    const unsub = subscribeSelectedState((s) => setSelectedState(s));
    return unsub;
  }, []);

  // Fetch tax rates once
  useEffect(() => {
    fetch("/api/admin/pricing-rules")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.taxRates) setTaxRates(data.taxRates); })
      .catch(() => {});
  }, []);

  const stateCode = resolveStateCode(selectedState);
  const taxRate = taxRates[stateCode]?.rate ?? 0;
  const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
  const total = subtotal + taxAmount;

  return (
    <aside className="ui-panel h-fit w-full rounded-lg border border-[#e5edf1] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800 sm:rounded-2xl sm:p-6">
      <div className="mb-4 sm:mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100 sm:text-sm">Promo Code</p>
        <div className="ui-subpanel mt-2 flex flex-col gap-2 rounded-lg border border-[#d8e5ea] bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 sm:mt-3 sm:flex-row sm:items-center sm:rounded-full sm:px-4 sm:py-3">
          <input
            type="text"
            placeholder="Enter promo code..."
            className="ui-input w-full bg-transparent text-xs outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
          />
          <button className="rounded-md bg-[#d7f3f0] px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:bg-[#c7ebeb] sm:rounded-full sm:px-4 sm:py-2 sm:text-sm">
            Apply
          </button>
        </div>
      </div>

      <div className="ui-divider mb-4 h-[1px] w-full bg-[#e5edf1] dark:bg-slate-700 sm:mb-5" />

      <div className="mb-5 space-y-3 sm:mb-6 sm:space-y-4">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
          <span>Tax</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {stateCode ? `$${taxAmount.toFixed(2)}` : "—"}
          </span>
        </div>

        <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full rounded-lg bg-[#56aebb] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#489fad] sm:rounded-full sm:py-3 sm:text-base"
      >
        Continue to Checkout
      </Link>

      <Link
        href="/our-products"
        className="mt-2 block w-full rounded-lg border border-[#d8e5ea] bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 sm:rounded-full sm:py-3 sm:text-base"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}
