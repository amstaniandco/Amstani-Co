"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  customOrderDetails?: { description: string; mediaUrls: string[] };
};

function variantLabel(selectedVariants?: Record<string, string>) {
  if (!selectedVariants) return "";
  return Object.values(selectedVariants).filter(Boolean).join(" / ");
}

function variantKey(selectedVariants?: Record<string, string>) {
  const entries = Object.entries(selectedVariants ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Edit state for custom order items
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editKeptUrls, setEditKeptUrls] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const editFileRef = useRef<HTMLInputElement>(null);

  const fetchCart = useCallback(() => {
    setLoading(true);
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  function openEdit(idx: number) {
    const cod = items[idx].customOrderDetails;
    if (!cod) return;
    setEditDesc(cod.description);
    setEditKeptUrls([...(cod.mediaUrls ?? [])]);
    setEditNewFiles([]);
    setEditNewPreviews([]);
    setEditMsg("");
    setEditIdx(idx);
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setEditNewFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setEditNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    if (editFileRef.current) editFileRef.current.value = "";
  }

  async function handleEditSave() {
    if (!editDesc.trim()) { setEditMsg("Please add a description."); return; }
    const allUrls = [...editKeptUrls];
    if (allUrls.length === 0 && editNewFiles.length === 0) { setEditMsg("Please attach at least one image."); return; }

    setEditSaving(true);
    setEditMsg("");
    try {
      for (const file of editNewFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (!d.url) throw new Error("Upload failed");
        allUrls.push(d.url);
      }

      if (allUrls.length === 0) { setEditMsg("Please attach at least one image."); setEditSaving(false); return; }

      const item = items[editIdx!];
      // Remove old item by index, then add updated one
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex: editIdx }),
      });
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          storeId: item.storeId,
          quantity: item.quantity,
          customOrderDetails: { description: editDesc.trim(), mediaUrls: allUrls },
        }),
      });
      fetchCart();
      setEditIdx(null);
    } catch {
      setEditMsg("Something went wrong. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  async function updateQty(productId: string, storeId: string, quantity: number, selectedVariants?: Record<string, string>) {
    const key = variantKey(selectedVariants);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, storeId, quantity, selectedVariants }),
    });
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.productId === productId && i.storeId === storeId && variantKey(i.selectedVariants) === key))
        : prev.map((i) => i.productId === productId && i.storeId === storeId && variantKey(i.selectedVariants) === key ? { ...i, quantity } : i)
    );
  }

  async function removeItem(idx: number) {
    const item = items[idx];
    if (item.customOrderDetails) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex: idx }),
      });
      setItems((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const key = variantKey(item.selectedVariants);
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, storeId: item.storeId, selectedVariants: item.selectedVariants }),
      });
      setItems((prev) => prev.filter((i) => !(i.productId === item.productId && i.storeId === item.storeId && variantKey(i.selectedVariants) === key)));
    }
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
                {items.map((item, idx) => {
                  const isCustom = !!item.customOrderDetails;
                  const cod = item.customOrderDetails;
                  return (
                    <div key={`${item.productId}-${item.storeId}-${idx}`}
                      className="rounded-xl border border-[#e5edf1] bg-[#f9fbfc] dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
                      {/* Main row */}
                      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                        {item.mainImage ? (
                          <img src={item.mainImage} alt={item.name} className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20 flex-shrink-0" />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-slate-200 sm:h-20 sm:w-20 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0f9488] sm:text-xs">{item.storeName}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2 dark:text-slate-100 sm:text-base">{item.name}</p>
                          {item.sku && !isCustom && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SKU: {item.sku}</p>}
                          {variantLabel(item.selectedVariants) && !isCustom && (
                            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{variantLabel(item.selectedVariants)}</p>
                          )}
                          {isCustom && (
                            <span className="mt-1 inline-block text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              Custom Order
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-3">
                          {!isCustom && (
                            <div className="flex items-center rounded-lg border border-[#d8e5ea] bg-white dark:border-slate-600 dark:bg-slate-800">
                              <button onClick={() => updateQty(item.productId, item.storeId, item.quantity - 1, item.selectedVariants)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">−</button>
                              <span className="w-8 text-center text-xs font-medium text-slate-900 dark:text-slate-100">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.storeId, item.quantity + 1, item.selectedVariants)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">+</button>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                            {isCustom && (
                              <button onClick={() => openEdit(idx)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-purple-500 transition hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20"
                                title="Edit custom order">✎</button>
                            )}
                            <button onClick={() => removeItem(idx)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#fee2e2] hover:text-[#dc2626] dark:text-slate-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-300">×</button>
                          </div>
                        </div>
                      </div>

                      {/* Custom order details panel */}
                      {cod && (
                        <div className="border-t border-purple-100 bg-purple-50 dark:bg-purple-900/10 px-4 py-3 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-purple-400">Custom Request Details</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{cod.description}</p>
                          {cod.mediaUrls?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {cod.mediaUrls.map((url, mi) => (
                                <button key={mi} onClick={() => setLightboxSrc(url)} className="focus:outline-none group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-purple-200 group-hover:opacity-90 transition" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:basis-[35%]">
          <CartSummary subtotal={subtotal} />
        </div>
      </div>

      {/* Edit modal for custom order */}
      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Edit Custom Request</h3>
              <button onClick={() => setEditIdx(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1">Description</label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Describe your custom order…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-purple-400 resize-none"
              />
            </div>

            {/* Existing images */}
            {editKeptUrls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current Images</p>
                <div className="flex flex-wrap gap-2">
                  {editKeptUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                      <button
                        onClick={() => setEditKeptUrls((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {editNewPreviews.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">New Images</p>
                <div className="flex flex-wrap gap-2">
                  {editNewPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                      <button
                        onClick={() => {
                          setEditNewFiles((prev) => prev.filter((_, j) => j !== i));
                          setEditNewPreviews((prev) => prev.filter((_, j) => j !== i));
                        }}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => editFileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-purple-300 bg-purple-50 dark:bg-purple-900/10 py-2.5 text-xs font-semibold text-purple-600 hover:bg-purple-100 transition"
            >
              + Add Images
            </button>
            <input ref={editFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditFileChange} />

            {editMsg && <p className="text-xs text-red-500">{editMsg}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditIdx(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition disabled:opacity-60">
                {editSaving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightboxSrc(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="Preview" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
