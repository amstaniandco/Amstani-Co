"use client";

const summary = {
  subtotal: "$4,250.00",
  totalTax: "$340.00",
  totalShipping: "$123",
  totalDue: "$4,590.00",
  storeA: "$2000.00",
  storeATax: "$123.00",
  storeAShipping: "$123.00",
  storeB: "$2250.00",
  storeBTax: "$123.00",
  storeBShipping: "$123.00",
};

export default function OrderSummary() {
  return (
    <div className="ui-panel rounded-2xl bg-white p-7 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-10">
      <h2 className="mb-5 text-2xl font-bold tracking-tight text-black dark:text-slate-100">
        Order Summary
      </h2>

      <div className="space-y-2.5 text-sm text-black/80 dark:text-slate-300">
        <LineItem label="Store A" value={summary.storeA} />
        <LineItem label="Store A Tax" value={summary.storeATax} />
        <LineItem label="Store A Shipping" value={summary.storeAShipping} />

        <div className="ui-divider h-px bg-gray-100 dark:bg-slate-700" />

        <LineItem label="Store B" value={summary.storeB} />
        <LineItem label="Store B Tax" value={summary.storeBTax} />
        <LineItem label="Store B Shipping" value={summary.storeBShipping} />

        <div className="ui-divider h-px bg-gray-100 dark:bg-slate-700" />

        <LineItem label="Subtotal" value={summary.subtotal} />

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-black/80 dark:text-slate-300">
            Sales Tax
            <span className="inline-flex h-3.5 w-3.5 cursor-default items-center justify-center rounded-full border border-gray-300 text-[9px] leading-none text-black/70 dark:border-slate-600 dark:text-slate-400">
              i
            </span>
          </span>
          <span className="font-medium text-black dark:text-slate-100">{summary.totalTax}</span>
        </div>

        <LineItem label="Total Shipping" value={summary.totalShipping} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t-2 border-gray-900 pt-4 dark:border-slate-600">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-slate-100">
          Total Due
        </span>
        <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">{summary.totalDue}</span>
      </div>

      <button className="mt-5 w-full py-4 rounded-[24px] bg-[#67B3BE] text-white text-sm font-semibold tracking-wide hover:bg-[#5fa7b2] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
        Select Payment Method
      </button>

      <p className="mt-3 text-center text-[11px] text-black/70 dark:text-slate-400">
        Secure payment processed via Amstani Global Gateway
      </p>
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-black/90 dark:text-slate-300">
      <span>{label}</span>
      <span className="font-medium text-black dark:text-slate-100">{value}</span>
    </div>
  );
}
