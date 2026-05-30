"use client";

import { useCallback, useEffect, useState } from "react";
import CartSummary from "./components/CartSummary";

type CartItem = {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
  selectedVariants?: Record<string, string>;
};

function variantLabel(selectedVariants?: Record<string, string>) {
  if (!selectedVariants) return "";
  return Object.values(selectedVariants).join(" / ");
}

function variantKey(selectedVariants?: Record<string, string>) {
  const entries = Object.entries(selectedVariants ?? {}).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  return JSON.stringify(entries);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function updateQty(productId: string, storeId: string, quantity: number) {
    const item = items.find((entry) => entry.productId === productId && entry.storeId === storeId);
    const key = variantKey(item?.selectedVariants);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, storeId, quantity, selectedVariants: item?.selectedVariants }),
    });
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.productId === productId && i.storeId === storeId && variantKey(i.selectedVariants) === key))
        : prev.map((i) => i.productId === productId && i.storeId === storeId && variantKey(i.selectedVariants) === key ? { ...i, quantity } : i)
    );
  }

  async function removeItem(productId: string, storeId: string) {
    const item = items.find((entry) => entry.productId === productId && entry.storeId === storeId);
    const key = variantKey(item?.selectedVariants);
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, storeId, selectedVariants: item?.selectedVariants }),
    });
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.storeId === storeId && variantKey(i.selectedVariants) === key)));
  }

  async function clearCart() {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:items-start lg:gap-8 lg:py-8">
        <div className="w-full lg:basis-[65%]">
          <div className="ui-panel w-full rounded-xl border border-[#e5edf1] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800 sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                Cart ({loading ? "…" : items.length} {items.length === 1 ? "product" : "products"})
              </h1>
              {items.length > 0 && (
                <button onClick={clearCart} className="w-fit rounded-full border border-[#fca5a5] bg-white px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition hover:bg-[#fef2f2] dark:border-rose-500/40 dark:bg-slate-700 dark:text-rose-300 sm:px-4 sm:py-2 sm:text-sm">
                  Clear cart ✕
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading cart…</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">Your cart is empty.</div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.storeId}`}
                    className="ui-subpanel flex flex-col gap-3 rounded-lg border border-[#e5edf1] bg-[#f9fbfc] p-3 transition hover:border-[#d0dce5] dark:border-slate-700 dark:bg-slate-900 sm:rounded-xl sm:p-4 sm:flex-row sm:items-center sm:gap-4">
                    {item.mainImage ? (
                      <img src={item.mainImage} alt={item.name} className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-slate-200 sm:h-20 sm:w-20" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0f9488] sm:text-xs">{item.storeName}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2 sm:text-base">{item.name}</p>
                      {item.sku && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SKU: {item.sku}</p>}
                      {variantLabel(item.selectedVariants) && (
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {variantLabel(item.selectedVariants)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-3">
                      <div className="ui-subpanel flex items-center rounded-lg border border-[#d8e5ea] bg-white dark:border-slate-600 dark:bg-slate-800">
                        <button onClick={() => updateQty(item.productId, item.storeId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">−</button>
                        <span className="w-8 text-center text-xs font-medium text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.storeId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">+</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button onClick={() => removeItem(item.productId, item.storeId)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#fee2e2] hover:text-[#dc2626] dark:text-slate-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-300">×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:basis-[35%]">
          <CartSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
