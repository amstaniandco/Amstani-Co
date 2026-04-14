"use client";

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

export default function WishlistPage() {
  return (
    <div className="rounded-2xl bg-white px-6 py-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Wishlist ({products.length} products)</h1>
        <button className="text-red-500 font-medium hover:text-red-600">Clear List ✕</button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                  {product.store}
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.variant}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 min-w-[125px]">
              <button className="w-8 h-8 border border-gray-300 rounded-full text-sm hover:bg-gray-100">−</button>
              <span className="text-sm font-medium">1</span>
              <button className="w-8 h-8 border border-gray-300 rounded-full text-sm hover:bg-gray-100">+</button>
            </div>

            <div className="flex items-center gap-0">
              <div className="text-2xl font-bold">${product.price}</div>
              <button className="text-teal-600 hover:text-red-500 font-bold text-3xl ml-3">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
