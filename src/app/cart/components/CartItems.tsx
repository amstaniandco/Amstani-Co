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
    <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cart ({products.length} products)</h1>
        <button className="text-red-500 font-semibold hover:text-red-600">Clear cart ✕</button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                  {product.store}
                </p>
                <p className="text-base font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.variant}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 min-w-[120px]">
              <button className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none hover:bg-white">−</button>
              <span className="text-sm font-medium">1</span>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none hover:bg-white">+</button>
            </div>

            <div className="flex items-center gap-0">
              <div className="text-2xl font-bold">${product.price}</div>
              <button className="text-gray-600 hover:text-red-500 font-bold text-3xl ml-3">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
