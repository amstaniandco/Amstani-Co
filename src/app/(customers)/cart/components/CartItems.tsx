type CartProduct = {
  id: number;
  image: string;
  store: string;
  name: string;
  variant: string;
  price: number;
};

interface CartItemsProps {
  products: CartProduct[];
}

export default function CartItems({ products }: CartItemsProps) {
  return (
    <div className="ui-panel w-full rounded-xl border border-[#e5edf1] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800 sm:rounded-2xl sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Cart ({products.length} {products.length === 1 ? 'product' : 'products'})</h1>
        <button className="w-fit rounded-full border border-[#fca5a5] bg-white px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition hover:bg-[#fef2f2] dark:border-rose-500/40 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/20 sm:px-4 sm:py-2 sm:text-sm">
          Clear cart ✕
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="ui-subpanel flex flex-col gap-3 rounded-lg border border-[#e5edf1] bg-[#f9fbfc] p-3 transition hover:border-[#d0dce5] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 sm:rounded-xl sm:p-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0f9488] sm:text-xs">
                {product.store}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2 sm:text-base">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{product.variant}</p>
            </div>

            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-3">
              {/* Quantity Controls */}
              <div className="ui-subpanel flex items-center rounded-lg border border-[#d8e5ea] bg-white dark:border-slate-600 dark:bg-slate-800">
                <button className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">
                  −
                </button>
                <span className="w-8 text-center text-xs font-medium text-slate-900 dark:text-slate-100">1</span>
                <button className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">
                  +
                </button>
              </div>

              {/* Price and Remove */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">${product.price}</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#fee2e2] hover:text-[#dc2626] dark:text-slate-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-300">
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
