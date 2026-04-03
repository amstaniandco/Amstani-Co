"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const LIVE_STORES = [
  {
    id: 1,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 2,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 3,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 4,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 5,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 6,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 7,
    name: "Brand Name",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=80&h=80&fit=crop",
    live: true,
  },
];

const ON_SALE_STORES = [
  {
    id: 1,
    name: "Name of store",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop",
  },
  {
    id: 2,
    name: "Name of store",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=60&h=60&fit=crop",
  },
  {
    id: 3,
    name: "Name of store",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=60&h=60&fit=crop",
  },
];

const BROWSE_STORES = [
  {
    id: 1,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "On Sale",
    badgeColor: "bg-red-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #1",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #1",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #5",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #6",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "On Sale",
    badgeColor: "bg-red-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
  },
];

const ACTIVE_ORDERS = [
  {
    id: "RAM-R621-8",
    status: "ACCEPTED",
    detail: "RAM-R054-C",
    sub: "Custom Work · Processing",
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h18M7 10h10M11 16h2"
    />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    className="w-3 h-3 text-yellow-400"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronDown = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveStoreAvatar({ store }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
      <div
        className={`relative w-16 h-20 rounded-sm overflow-hidden ${store.live ? "border-2 border-red-500" : "border-2 border-gray-200"}`}
      >
        <div className="w-full h-full rounded-sm relative">
          <Image
            src={store.img}
            alt={store.name}
            fill
            sizes="64px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <span className="text-[11px] text-gray-600 font-medium text-center truncate w-16">
        {store.name}
      </span>
    </div>
  );
}

function StoreCard({ store }) {
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-[200px]">
        <Image
          src={store.img}
          alt={store.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2 left-2">
          <span
            className={`${store.badgeColor} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}
          >
            {store.badge}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-teal-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {store.badge.startsWith("Ranked") ? store.badge : "Best #1"}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          {/* Rating + Bookmark row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <StarIcon />
              <span className="text-white text-[10px] font-semibold">
                {store.rating}
              </span>
            </div>
            <button className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <BookmarkIcon />
            </button>
          </div>

          <h3 className="text-white font-bold text-sm leading-tight">
            {store.name}
          </h3>
          <p className="text-gray-300 text-[10px] mt-0.5 leading-snug line-clamp-1">
            {store.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1">
            <LocationIcon />
            <span className="text-gray-300 text-[10px]">{store.state}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = BROWSE_STORES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <div className="w-full mx-auto px-4 py-6 flex gap-5">
        {/* ── Left Main Column ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Live Stores */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Live Stores{" "}
                <span className="text-gray-400 font-normal">(11)</span>
              </h2>
              <Link
                href="/stores/live"
                className="text-sm text-teal-600 font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {LIVE_STORES.map((store) => (
                <LiveStoreAvatar key={store.id} store={store} />
              ))}
            </div>
          </section>

          {/* Browse Stores */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Browse Stores</h2>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a store"
                    className="pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-full bg-white outline-none focus:border-teal-400 transition-colors w-40"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                </div>
                {/* Filter */}
                <button className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:border-teal-400 hover:text-teal-500 transition-colors">
                  <FilterIcon />
                </button>
              </div>
            </div>

            {/* Store Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {/* Load more chevron */}
            <div className="flex justify-center mt-6">
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
                <ChevronDown />
              </button>
            </div>
          </section>
        </div>

        {/* ── Right Sidebar ───────────────────────────────────────────────── */}
        <aside className="w-56 shrink-0 space-y-4">
          {/* On Sale */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">!</span>
              </span>
              <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                On Sale
              </span>
            </div>

            <div className="space-y-3">
              {ON_SALE_STORES.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={store.img}
                      alt={store.name}
                      fill
                      sizes="40px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-teal-600 transition-colors">
                    {store.name}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full border border-gray-200 rounded-full text-xs text-gray-600 py-1.5 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium">
              View All
            </button>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                Active Orders
              </span>
            </div>

            {ACTIVE_ORDERS.map((order) => (
              <div key={order.id} className="space-y-2">
                {/* Order in progress */}
                <div className="flex items-start gap-2">
                  <div className="w-1 self-stretch bg-teal-200 rounded-full" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Pending Tackle
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      {order.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 self-stretch bg-green-200 rounded-full" />
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      {order.status}
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      {order.detail}
                    </p>
                    <p className="text-[10px] text-gray-400">{order.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            <button className="mt-4 w-full border border-gray-200 rounded-full text-xs text-gray-600 py-1.5 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium">
              View All History
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
