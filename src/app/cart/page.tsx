const products = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
];

export default function CartPage() {
  const total = products.length;
  const subtotal = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start h-fit">
      <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Cart ({total} products)</h1>
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

      <aside className="w-[320px] h-fit rounded-[28px] bg-white p-6 shadow-md border border-gray-100 mx-auto xl:mx-0">
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

        <div className="h-[1px] w-full bg-gray-200 mb-5"></div>

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
    </div>
  );
}

