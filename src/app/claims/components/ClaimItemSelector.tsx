type Product = {
  id: number;
  image: string;
  store: string;
  name: string;
  variant: string;
  price: number;
};

interface ClaimItemSelectorProps {
  products: Product[];
  quantities: { [key: number]: number };
  selected: { [key: number]: boolean };
  handleQty: (id: number, delta: number) => void;
  toggleSelect: (id: number) => void;
}

export default function ClaimItemSelector({
  products,
  quantities,
  selected,
  handleQty,
  toggleSelect,
}: ClaimItemSelectorProps) {
  return (
    <div className="bg-white rounded-2xl p-6 w-full shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-gray-800">Select Disputed Item</h2>
        <span className="text-xs font-medium text-red-500 cursor-pointer">Report All</span>
      </div>

      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
            />

            <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
              <div className="min-w-0 max-w-[55%]">
                <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                  {product.store}
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{product.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{product.variant}</p>
              </div>

              <div className="flex items-center justify-center gap-1.5 min-w-[92px]">
                <button
                  onClick={() => handleQty(product.id, -1)}
                  className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 text-sm leading-none hover:bg-gray-100 cursor-pointer"
                >
                  −
                </button>
                <span className="text-xs font-medium text-gray-700 w-3 text-center">
                  {quantities[product.id]}
                </span>
                <button
                  onClick={() => handleQty(product.id, 1)}
                  className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 text-sm leading-none hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="text-sm font-bold text-gray-800 flex-shrink-0 w-16 text-center">
                ${product.price}
              </span>
            </div>

            <div
              onClick={() => toggleSelect(product.id)}
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                selected[product.id]
                  ? "bg-teal-500 border-teal-500"
                  : "bg-white border-gray-300"
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
        ))}
      </div>
    </div>
  );
}
