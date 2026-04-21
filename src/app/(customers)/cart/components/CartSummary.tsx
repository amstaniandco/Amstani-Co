import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className="w-full h-fit rounded-lg border border-[#e5edf1] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:rounded-2xl sm:p-6">
      <div className="mb-4 sm:mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-900 sm:text-sm">Promo Code</p>

        <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#d8e5ea] bg-white px-3 py-2 sm:mt-3 sm:rounded-full sm:px-4 sm:py-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Enter promo code..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm"
          />
          <button className="rounded-md bg-[#d7f3f0] px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:bg-[#c7ebeb] sm:rounded-full sm:px-4 sm:py-2 sm:text-sm">
            Apply
          </button>
        </div>
      </div>

      <div className="mb-4 h-[1px] w-full bg-[#e5edf1] sm:mb-5" />

      <div className="mb-5 space-y-3 sm:mb-6 sm:space-y-4">
        <div className="flex justify-between text-xs text-slate-600 sm:text-sm">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-xs text-slate-600 sm:text-sm">
          <span>Discount</span>
          <span className="font-medium text-slate-900">$0.00</span>
        </div>

        <div className="flex justify-between text-xs font-semibold text-slate-900 sm:text-base">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
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
        className="mt-2 block w-full rounded-lg border border-[#d8e5ea] bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:rounded-full sm:py-3 sm:text-base"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}
