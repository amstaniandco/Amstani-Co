"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "../../../../hooks/useWishlist";

interface NewArrivalProduct {
  productId: string;
  storeId: string;
  name: string;
  storeName: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number;
  mainImage: string | null;
}

const SparkleIcon = () => (
  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function NewArrivalsSection({ products }: { products: NewArrivalProduct[] }) {
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  if (!products.length) return null;

  return (
    <section className="home-section mb-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <h2 className="home-heading text-[24px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[28px]">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/new-arrivals"
          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-[#7ad5df] dark:hover:text-[#4DB8B8]"
        >
          View All
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((p) => {
          const img = p.mainImage ?? "/assets/placeholder-store.svg";
          const hasDiscount = p.discountPercent > 0 && p.compareAtPrice;
          const wishlisted = isWishlisted(p.productId, p.storeId);

          return (
            <div
              key={`${p.productId}-${p.storeId}`}
              className="group relative min-w-[140px] flex-shrink-0 overflow-hidden rounded-2xl border border-[#d7dde4] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-[#0f1b2f] sm:min-w-[160px]"
            >
              {/* Wishlist button */}
              <button
                type="button"
                onClick={() => toggleWishlist({
                  productId: p.productId,
                  storeId: p.storeId,
                  storeName: p.storeName,
                  name: p.name,
                  price: p.price,
                  mainImage: p.mainImage,
                })}
                className={`absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow transition ${
                  wishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-slate-400 hover:text-red-400 dark:bg-slate-800/90"
                }`}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className="w-3 h-3"
                  fill={wishlisted ? "currentColor" : "none"}
                  strokeWidth={1.8}
                />
              </button>

              <Link href={`/product?productId=${p.productId}&storeId=${p.storeId}`}>
                <div className="relative h-[140px] overflow-hidden sm:h-[160px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder-store.svg"; }}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    New
                  </span>
                  {hasDiscount && (
                    <span className="absolute left-2 top-6 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white mt-1">
                      -{p.discountPercent}%
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-[11px] font-semibold text-slate-800 dark:text-slate-100 sm:text-xs">
                    {p.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                    {p.storeName}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ${p.price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-slate-400 line-through dark:text-slate-500">
                        ${p.compareAtPrice!.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
