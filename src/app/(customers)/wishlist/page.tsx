"use client";

import { useEffect, useState } from "react";
import { fetchAndUpdateCartCount } from "../../../lib/cart-events";

function dispatchWishlistUpdate(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count } }));
  }
}

type WishlistItem = {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeItem(productId: string, storeId: string) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, storeId }),
    });
    setItems((prev) => {
      const next = prev.filter((i) => !(i.productId === productId && i.storeId === storeId));
      dispatchWishlistUpdate(next.length);
      return next;
    });
  }

  async function clearWishlist() {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    setItems([]);
    dispatchWishlistUpdate(0);
  }

  async function moveToCart(item: WishlistItem) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.productId,
        storeId: item.storeId,
        storeName: item.storeName,
        name: item.name,
        sku: item.sku,
        price: item.price,
        mainImage: item.mainImage,
        quantity: 1,
      }),
    });
    if (res.ok) {
      fetchAndUpdateCartCount();
      removeItem(item.productId, item.storeId);
    }
  }

  return (
    <div className="rounded-2xl bg-white px-6 py-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">
          Wishlist ({loading ? "…" : items.length} products)
        </h1>
        {items.length > 0 && (
          <button onClick={clearWishlist} className="text-red-500 font-medium hover:text-red-600">
            Clear List ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading wishlist…</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">Your wishlist is empty.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={`${item.productId}-${item.storeId}-${idx}`}
              className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                {item.mainImage ? (
                  <img src={item.mainImage} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">{item.storeName}</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{item.name}</p>
                  {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-xl font-bold">${Number(item.price).toLocaleString()}</div>
                <button onClick={() => moveToCart(item)}
                  className="rounded-lg bg-[#68B8C1] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4f9ea7] transition">
                  Add to Cart
                </button>
                <button onClick={() => removeItem(item.productId, item.storeId)}
                  className="text-teal-600 hover:text-red-500 font-bold text-2xl leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
