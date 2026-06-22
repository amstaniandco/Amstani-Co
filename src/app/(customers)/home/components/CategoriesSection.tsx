"use client";

import { useMemo } from "react";
import Link from "next/link";

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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop";

function getCategoryImage(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return CATEGORY_IMAGES[name.toLowerCase().trim()] ?? FALLBACK_IMAGE;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  // Pick 4 random categories that fill the row
  const displayed = useMemo(() => {
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [categories]);

  return (
    <section className="home-section mb-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="home-heading text-[24px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[28px]">
          Browse by categories
        </h2>
        {categories.length > 4 && (
          <Link
            href="/categories"
            className="text-sm font-semibold text-[#68B8C1] hover:text-[#4f9ea7] transition"
          >
            View all ({categories.length})
          </Link>
        )}
      </div>

      <div className="grid grid-cols-4 gap-5">
        {displayed.map((cat) => {
          const img = getCategoryImage(cat.name, cat.imageUrl);
          return (
            <Link
              key={cat._id}
              href={`/our-products?category=${encodeURIComponent(cat.slug || cat.name)}`}
              className="group relative cursor-pointer overflow-hidden rounded-2xl focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={cat.name}
                className="aspect-[3/2] w-full object-cover brightness-90 transition-all duration-300 group-hover:brightness-100 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-[#68B8C1]/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
