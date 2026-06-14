"use client";

import { useCallback, useEffect, useState } from "react";

export type WishlistProduct = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
};

function dispatchWishlistUpdate(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count } }));
  }
}

export function useWishlist() {
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  // Load current wishlist on mount
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        const keys = new Set<string>(
          (data.items ?? []).map((i: WishlistProduct) => `${i.productId}:${i.storeId}`)
        );
        setWishlisted(keys);
        dispatchWishlistUpdate(keys.size);
      })
      .catch(() => {});
  }, []);

  const isWishlisted = useCallback(
    (productId: string, storeId: string) => wishlisted.has(`${productId}:${storeId}`),
    [wishlisted]
  );

  const toggle = useCallback(
    async (product: WishlistProduct) => {
      const key = `${product.productId}:${product.storeId}`;
      // Optimistic update
      let newSize = 0;
      setWishlisted((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        newSize = next.size;
        return next;
      });
      dispatchWishlistUpdate(newSize);

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });
        if (!res.ok) {
          // Revert on failure
          setWishlisted((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            dispatchWishlistUpdate(next.size);
            return next;
          });
        }
      } catch {
        // Revert on network error
        setWishlisted((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          dispatchWishlistUpdate(next.size);
          return next;
        });
      }
    },
    []
  );

  return { isWishlisted, toggle };
}
