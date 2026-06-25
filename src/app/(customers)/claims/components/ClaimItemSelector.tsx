type Product = {
  id: string;
  orderId: string;
  image: string;
  store: string;
  name: string;
  variant: string;
  price: number;
  maxQty: number;
};

interface ClaimItemSelectorProps {
  products: Product[];
  quantities: { [key: string]: number };
  selected: { [key: string]: boolean };
  handleQty: (id: string, delta: number) => void;
  toggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

export default function ClaimItemSelector({
  products,
  quantities,
  selected,
  handleQty,
  toggleSelect,
  onSelectAll,
}: ClaimItemSelectorProps) {
  if (!products.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-3">Select Disputed Item</h2>
        <p className="text-sm text-gray-400 dark:text-slate-500">No orders found to file a claim against.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-200">Select Disputed Item</h2>
        <span
          onClick={onSelectAll}
          className="text-xs font-medium text-red-500 cursor-pointer"
        >
          Report All
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {products.map((product) => {
          const qty = quantities[product.id] ?? 1;
          const atMax = qty >= product.maxQty;
          const atMin = qty <= 1;

          return (
            <div
              key={product.id}
              className="flex flex-col gap-2 p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-xl"
            >
              {/* Main row */}
              <div className="flex items-center gap-3">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop"}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 max-w-[50%]">
                    <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                      {product.store}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate mt-0.5">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{product.variant}</p>
                  </div>

                  {/* Qty stepper */}
                  <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQty(product.id, -1)}
                        disabled={atMin}
                        className="w-5 h-5 rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300 text-sm leading-none hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-200 w-5 text-center">{qty}</span>
                      <button
                        onClick={() => handleQty(product.id, 1)}
                        disabled={atMax}
                        className="w-5 h-5 rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300 text-sm leading-none hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">max {product.maxQty}</span>
                  </div>

                  <span className="text-sm font-bold text-gray-800 dark:text-slate-100 flex-shrink-0 w-14 text-right">
                    ${product.price}
                  </span>
                </div>

                {/* Checkbox */}
                <div
                  onClick={() => toggleSelect(product.id)}
                  className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                    selected[product.id]
                      ? "bg-teal-500 border-teal-500"
                      : "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500"
                  }`}
                >
                  {selected[product.id] && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3.5L3 5.5L8 1"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
