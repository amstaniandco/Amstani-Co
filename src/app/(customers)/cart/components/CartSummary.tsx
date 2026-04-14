interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className="w-full h-fit rounded-[28px] bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900 mb-2">Promo Code</p>

        <div className="flex items-center justify-between border border-gray-300 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Type here..."
            className="w-full bg-transparent outline-none text-sm text-gray-500 placeholder:text-gray-400"
          />
          <button className="text-gray-500 hover:text-gray-700">▶</button>
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

      <button className="w-full rounded-full bg-teal-400 py-3 text-white font-medium hover:bg-teal-500 transition">
        Continue to Checkout
      </button>
    </aside>
  );
}
