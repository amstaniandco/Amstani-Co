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
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">Cart ({products.length} products)</h1>
        <button className="w-fit rounded-full border border-red-200 px-4 py-2 text-red-500 font-semibold transition hover:border-red-300 hover:text-red-600">
          Clear cart ✕
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-full max-w-full flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex w-full items-start gap-4 min-w-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="min-w-0 w-full">
                <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                  {product.store}
                </p>
                <p className="text-base font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.variant}</p>
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <div className="flex w-full items-center justify-between gap-3 rounded-full border border-gray-300 bg-white p-1 sm:w-auto sm:justify-center">
                <button className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none hover:bg-gray-100">−</button>
                <span className="text-sm font-medium">1</span>
                <button className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none hover:bg-gray-100">+</button>
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
                <div className="text-2xl font-bold">${product.price}</div>
                <button className="text-gray-600 hover:text-red-500 font-bold text-3xl leading-none">×</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
