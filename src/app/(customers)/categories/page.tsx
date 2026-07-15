"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop",
  pants: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop",
  jackets: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop",
  bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  men: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=400&fit=crop",
  women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
  kids: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&h=400&fit=crop",
  others: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
};
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop";

function getCatImage(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return CATEGORY_IMAGES[name.toLowerCase().trim()] ?? FALLBACK_IMG;
}

type Category = {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
            All Categories
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery.trim()
                ? `${filtered.length} of ${categories.length} ${categories.length === 1 ? "category" : "categories"}`
                : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#68B8C1] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            {searchQuery.trim() ? `No categories match "${searchQuery}".` : "No categories found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
            {filtered.map((cat) => (
              <Link
                key={cat._id}
                href={`/our-products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="group relative cursor-pointer overflow-hidden rounded-2xl focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCatImage(cat.name, cat.imageUrl)}
                  alt={cat.name}
                  className="aspect-[3/2] w-full object-cover brightness-90 transition-all duration-300 group-hover:brightness-100 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-[#68B8C1]/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
