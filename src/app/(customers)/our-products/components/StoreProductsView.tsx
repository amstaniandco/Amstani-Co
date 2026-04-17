"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
  const [query, setQuery] = useState("");
  const activeFilter = pathname === "/new-arrivals" ? "new-arrivals" : "sale";

  useEffect(() => {
    const url = new URL(window.location.href);
    setQuery((url.searchParams.get("q") ?? "").trim().toLowerCase());
  }, [pathname]);

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
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6 pt-10">
      <div className="w-full max-w-6xl rounded-3xl bg-gray-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
            <Box className="h-5 w-5 text-cyan-600" />
          </div>
          <h2 className="font-semibold text-black text-xl sm:text-2xl">
            {pageTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-4 shadow-sm"
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
                  <Link href="/product" className="font-medium text-black hover:text-cyan-600">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1 text-cyan-600 text-sm">
                    <Star size={14} />
                    {item.rating}
                  </div>
                </div>
                <p className="text-sm text-black mb-3">{item.store}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg text-black">
                      ${item.price}
                    </span>
                    {item.oldPrice > 0 && (
                      <span className="text-black line-through ml-2 text-sm">
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
            <div className="col-span-full rounded-3xl bg-white p-8 text-center text-black/70 shadow-sm">
              No products found for your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
