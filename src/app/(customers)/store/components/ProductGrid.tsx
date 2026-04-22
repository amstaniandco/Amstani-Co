import Image from "next/image";
import Link from "next/link";

const products = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: "Name of product",
  price: 51,
  oldPrice: 60,
  rating: 4.9,
  image:
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
}));

export default function ProductGrid() {
  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[#5fb9c3]">📦</span>
        <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <Link href="/product" className="relative block h-[300px] w-full overflow-hidden bg-white dark:bg-slate-900">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </Link>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href="/product" className="text-sm font-semibold text-[#68B8C1] hover:text-[#4f9ea7]">
                    {product.name}
                  </Link>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Best seller</p>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#68B8C1] shadow-sm dark:bg-slate-800 dark:text-[#7dc8d1]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {product.rating}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">${product.price}</p>
                  <p className="text-sm text-slate-400 line-through dark:text-slate-500">${product.oldPrice}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/wishlist" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-500 transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.1 21.55l-.1.1-.11-.1C7.14 17.24 4 14.39 4 10.5 4 7.42 6.42 5 9.5 5c1.74 0 3.41.81 4.5 2.09C15.09 5.81 16.76 5 18.5 5 21.58 5 24 7.42 24 10.5c0 3.89-3.14 6.74-7.9 11.05z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link href="/cart" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#68B8C1] text-white transition hover:bg-[#4f9ea7]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 6h.01M6 6l1.5 9.3a1 1 0 001 .92h9a1 1 0 001-.92L18 6H6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4a2 2 0 114 0v2m4 0V4a2 2 0 114 0v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
