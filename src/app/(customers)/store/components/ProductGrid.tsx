import Image from "next/image";
import Link from "next/link";

const products = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: "Name of product",
  price: 51,
  oldPrice: 60,
  rating: 4.9,
  image: "/product.png",
}));

export default function ProductGrid() {
  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[#5fb9c3]">📦</span>
        <h3 className="text-base font-semibold text-gray-800">Our Products</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <Link href="/product" className="block relative h-[230px] w-full overflow-hidden rounded-2xl bg-gray-100">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </Link>

            <div className="mt-3 flex items-start justify-between">
              <div>
                <Link href="/product" className="text-sm font-semibold text-gray-800 hover:text-[#5fb9c3]">
                  {product.name}
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">${product.price}</p>
                  <p className="text-sm text-gray-400 line-through">${product.oldPrice}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-[#5fb9c3]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block mr-1"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {product.rating}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link href="/wishlist" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
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
                  <Link href="/cart" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5fb9c3] text-white hover:bg-[#4aaab4]">
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
