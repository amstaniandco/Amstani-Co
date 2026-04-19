import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className="w-full h-fit rounded-[28px] bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900 mb-2">Promo Code</p>

        <div className="flex flex-col gap-3 border border-gray-300 rounded-full px-4 py-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Type here..."
            className="w-full bg-transparent outline-none text-sm text-gray-500 placeholder:text-gray-400"
          />
          <button className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-200 sm:py-1">
            ▶
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-200 mb-5" />

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(1)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Discount</span>
          <span>$0</span>
        </div>

        <div className="flex justify-between text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>${subtotal.toFixed(1)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full rounded-full bg-teal-400 py-3 text-center text-white font-medium hover:bg-teal-500 transition"
      >
        Continue to Checkout
      </Link>
    </aside>
  );
}
