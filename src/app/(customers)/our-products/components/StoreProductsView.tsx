"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, Star, Box } from "lucide-react";

const products = [
  {
    name: "Name of product",
    store: "Store name",
    price: 51,
    oldPrice: 60,
    rating: 4.9,
    image: "/pants.jpg",
    status: "sale",
  },
  {
    name: "New Arrival Jacket",
    store: "Fresh Threads",
    price: 72,
    oldPrice: 0,
    rating: 4.7,
    image: "/jacket.jpg",
    status: "new-arrivals",
  },
  {
    name: "Spring Sneakers",
    store: "Footworks",
    price: 45,
    oldPrice: 55,
    rating: 4.8,
    image: "/sneakers.jpg",
    status: "sale",
  },
  {
    name: "Limited Edition Tee",
    store: "Streetwear Co.",
    price: 39,
    oldPrice: 49,
    rating: 4.6,
    image: "/shirt.jpg",
    status: "new-arrivals",
  },
  {
    name: "Bold Denim",
    store: "Denim Depot",
    price: 63,
    oldPrice: 75,
    rating: 4.9,
    image: "/denim.jpg",
    status: "sale",
  },
  {
    name: "Classic Cap",
    store: "Hat House",
    price: 22,
    oldPrice: 0,
    rating: 4.4,
    image: "/cap.jpg",
    status: "new-arrivals",
  },
  {
    name: "Cozy Knit",
    store: "Winter Wear",
    price: 58,
    oldPrice: 68,
    rating: 4.8,
    image: "/sweater.jpg",
    status: "sale",
  },
  {
    name: "Sport Shorts",
    store: "Active Gear",
    price: 34,
    oldPrice: 0,
    rating: 4.5,
    image: "/shorts.jpg",
    status: "new-arrivals",
  },
  {
    name: "Vibrant Scarf",
    store: "Accessorize",
    price: 28,
    oldPrice: 34,
    rating: 4.7,
    image: "/scarf.jpg",
    status: "sale",
  },
];

export default function StoreProductsView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const activeFilter = pathname === "/new-arrivals" ? "new-arrivals" : "sale";

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.store.toLowerCase().includes(query);
      const matchesFilter = query ? true : item.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, query]);

  const pageTitle = query
    ? `Search results for "${query}"`
    : activeFilter === "sale"
    ? "Sale Products"
    : "New Arrivals";

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-10 dark:bg-slate-950">
      <div className="ui-panel w-full rounded-3xl bg-gray-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 dark:bg-slate-800">
            <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>
          <h2 className="text-xl font-semibold text-black dark:text-slate-100 sm:text-2xl">
            {pageTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <div
                key={index}
                className="ui-subpanel rounded-3xl bg-white p-4 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800"
              >
                <Link href="/product" className="block w-full h-56 relative rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex justify-between items-center mb-1">
                  <Link href="/product" className="font-medium text-black hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1 text-cyan-600 text-sm dark:text-cyan-300">
                    <Star size={14} />
                    {item.rating}
                  </div>
                </div>
                <p className="mb-3 text-sm text-black dark:text-slate-300">{item.store}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-black dark:text-slate-100">
                      ${item.price}
                    </span>
                    {item.oldPrice > 0 && (
                      <span className="ml-2 text-sm text-black line-through dark:text-slate-400">
                        ${item.oldPrice}
                      </span>
                    )}
                  </div>
                  <Link href="/cart" className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full transition">
                    <ShoppingCart size={18} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="ui-subpanel col-span-full rounded-3xl bg-white p-8 text-center text-black/70 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No products found for your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
