"use client";

import { useCallback, useEffect, useReducer } from "react";

export type WishlistProduct = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
};

// ── Module-level shared wishlist state ────────────────────────────────────────
// All mounted useWishlist instances share a single Set so toggling via one
// product card is immediately reflected in all others and the count is always
// the true total, not a per-card guess.

let sharedKeys = new Set<string>();
let fetchPromise: Promise<void> | null = null;
let lastUserId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function dispatchWishlistUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: sharedKeys.size } }));
  }
}

function getCurrentUserId(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split(";").find((c) => c.trim().startsWith("token="));
  if (!entry) return null;
  const token = entry.trim().slice("token=".length);
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

function resetSharedState() {
  sharedKeys = new Set();
  fetchPromise = null;
  lastUserId = null;
  notify();
}

function ensureLoaded() {
  const userId = getCurrentUserId();

  // Reset if the user changed (e.g. switched accounts without a hard reload)
  if (userId !== lastUserId) {
    resetSharedState();
    lastUserId = userId;
  }

  if (!userId) return Promise.resolve();
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/wishlist")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data) {
        resetSharedState();
        return;
      }
      sharedKeys = new Set<string>(
        (data.items ?? []).map((i: WishlistProduct) => `${i.productId}:${i.storeId}`)
      );
      notify();
      // Intentionally NOT dispatching wishlist-updated here — the Header already
      // fetches its own initial count on login. Dispatching here would race with
      // optimistic toggle events and reset the badge to a stale value.
    })
    .catch(() => {});

  return fetchPromise;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWishlist() {
  // Trigger re-render for this component instance when shared state changes
  const [, tick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    listeners.add(tick);
    ensureLoaded();
    return () => {
      listeners.delete(tick);
    };
  }, []);

  const isWishlisted = useCallback(
    (productId: string, storeId: string) => sharedKeys.has(`${productId}:${storeId}`),
    []
  );

  const toggle = useCallback(async (product: WishlistProduct) => {
    const key = `${product.productId}:${product.storeId}`;
    const wasIn = sharedKeys.has(key);

    // Optimistic update — mutate shared Set and notify all instances
    if (wasIn) sharedKeys.delete(key);
    else sharedKeys.add(key);
    notify();
    dispatchWishlistUpdate();

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) {
        // Revert on failure
        if (wasIn) sharedKeys.add(key);
        else sharedKeys.delete(key);
        notify();
        dispatchWishlistUpdate();
      }
    } catch {
      // Revert on network error
      if (wasIn) sharedKeys.add(key);
      else sharedKeys.delete(key);
      notify();
      dispatchWishlistUpdate();
    }
  }, []);

  return { isWishlisted, toggle };
}

export function resetWishlistState() {
  resetSharedState();
}
