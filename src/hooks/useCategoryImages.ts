"use client";

import { useEffect, useState } from "react";

// Canonical fallback images, used when a category has no admin-set cover photo.
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

export const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop";

// Module-level cache so the categories list is fetched once per session and
// shared across every product/category view that needs cover photos.
let cachedMap: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

async function loadCategoryImages(): Promise<Record<string, string>> {
  if (cachedMap) return cachedMap;
  if (!fetchPromise) {
    fetchPromise = fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        for (const cat of (data.categories ?? []) as Array<{ name?: string; imageUrl?: string }>) {
          if (cat.name && cat.imageUrl) map[cat.name.toLowerCase().trim()] = cat.imageUrl;
        }
        cachedMap = map;
        return map;
      })
      .catch(() => {
        cachedMap = {};
        return cachedMap;
      });
  }
  return fetchPromise;
}

/**
 * Returns a resolver that maps a category name to its cover photo, preferring
 * the admin-set image from the categories collection and falling back to the
 * canonical hardcoded image (and finally a generic fallback).
 */
export function useCategoryImages() {
  const [map, setMap] = useState<Record<string, string>>(cachedMap ?? {});

  useEffect(() => {
    let active = true;
    loadCategoryImages().then((loaded) => {
      if (active) setMap(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const getCategoryImage = (name: string): string => {
    const key = name.toLowerCase().trim();
    return map[key] ?? CATEGORY_IMAGES[key] ?? FALLBACK_CATEGORY_IMAGE;
  };

  return { getCategoryImage, FALLBACK_CATEGORY_IMAGE };
}
