"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, TrendingDown, TrendingUp, RotateCcw } from "lucide-react";

type CatalogProduct = {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: { name?: string } | null;
  mainImage?: string | null;
  imageUrls?: string[];
  originalPrice: number;
  adminAdjustedPrice?: number | null;
  price: number;
  discountPercent?: number;
  isOnSale?: boolean;
  totalStock?: number;
  allowCustomOrders?: boolean;
};

export default function OwnerCatalogPage() {
  const [products,      setProducts]      = useState<CatalogProduct[]>([]);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [discountCap,   setDiscountCap]   = useState(20);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");

  // Bulk pricing state
  const [mode,       setMode]       = useState<"markup" | "discount">("markup");
  const [pctInput,   setPctInput]   = useState("");
  const [applying,   setApplying]   = useState(false);
  const [resetting,  setResetting]  = useState(false);
  const [msg,        setMsg]        = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/owner/catalog")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setMarkupPercent(data.markupPercent ?? 20);
        setDiscountCap(data.discountCap ?? 20);
      })
      .finally(() => setLoading(false));
  }, []);

  const capForMode = mode === "markup" ? markupPercent : discountCap;

  async function applyBulk() {
    const pct = parseFloat(pctInput);
    if (isNaN(pct) || pct < 0) { setMsg({ ok: false, text: "Enter a valid percentage." }); return; }
    if (pct > capForMode) { setMsg({ ok: false, text: `Max allowed: ${capForMode}% (platform limit).` }); return; }
    setApplying(true); setMsg(null);
    try {
      const res = await fetch("/api/owner/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, percent: pct }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ ok: false, text: data.error || "Failed." }); return; }
      setMsg({ ok: true, text: `Applied ${mode === "markup" ? "+" : "−"}${pct}% to ${data.updatedCount} products.` });
      setPctInput("");
      // Refresh products
      const refreshed = await fetch("/api/owner/catalog").then((r) => r.json());
      setProducts(refreshed.products ?? []);
    } finally { setApplying(false); }
  }

  async function resetAll() {
    setResetting(true); setMsg(null);
    try {
      const res = await fetch("/api/owner/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ ok: false, text: data.error || "Failed." }); return; }
      setMsg({ ok: true, text: `Reset ${data.updatedCount} products to catalog prices.` });
      const refreshed = await fetch("/api/owner/catalog").then((r) => r.json());
      setProducts(refreshed.products ?? []);
    } finally { setResetting(false); }
  }

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <Link href="/products" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Amstani &amp; Co&apos;s Catalog
            </h1>
            {!loading && <p className="text-sm text-slate-500 mt-0.5">{products.length} products</p>}
          </div>
        </div>

        {/* ── Bulk pricing panel ── */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-800 mb-1">Bulk Price Adjustment</p>
          <p className="text-xs text-slate-500 mb-4">
            Apply a markup or discount to <span className="font-semibold">all products</span> instantly. Markup max: <span className="font-semibold">{markupPercent}%</span> · Discount max: <span className="font-semibold">{discountCap}%</span>.
          </p>

          <div className="flex flex-wrap items-end gap-3">
            {/* Mode toggle */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setMode("markup")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition ${mode === "markup" ? "bg-teal-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <TrendingUp className="h-4 w-4" /> Markup
              </button>
              <button
                type="button"
                onClick={() => setMode("discount")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition ${mode === "discount" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <TrendingDown className="h-4 w-4" /> Discount
              </button>
            </div>

            {/* Percentage input */}
            <div className="flex-1 min-w-[140px]">
              <div className="relative">
                <input
                  type="number" min="0" max={capForMode} step="0.1"
                  value={pctInput} onChange={(e) => setPctInput(e.target.value)}
                  placeholder={`0–${capForMode}`}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#68B8C1]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">%</span>
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={applyBulk}
              disabled={applying || !pctInput}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${mode === "markup" ? "bg-teal-500 hover:bg-teal-600" : "bg-amber-500 hover:bg-amber-600"}`}
            >
              {applying ? "Applying…" : `Apply ${mode === "markup" ? "Markup" : "Discount"}`}
            </button>

            {/* Reset */}
            <button
              onClick={resetAll}
              disabled={resetting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              {resetting ? "Resetting…" : "Reset All"}
            </button>
          </div>

          {/* Preview */}
          {pctInput && parseFloat(pctInput) > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Preview: a ${" "}
              <span className="font-semibold">$100.00</span> product becomes{" "}
              <span className={`font-bold ${mode === "markup" ? "text-teal-600" : "text-amber-600"}`}>
                ${mode === "markup"
                  ? (100 * (1 + parseFloat(pctInput) / 100)).toFixed(2)
                  : (100 * (1 - parseFloat(pctInput) / 100)).toFixed(2)}
              </span>
              {mode === "discount" && ` (${parseFloat(pctInput)}% off)`}
            </p>
          )}

          {/* Message */}
          {msg && (
            <div className={`mt-3 flex items-start justify-between rounded-xl px-4 py-2.5 text-sm ${msg.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              <span>{msg.text}</span>
              <button onClick={() => setMsg(null)} className="ml-4 shrink-0 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm" />
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="h-40 bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((product) => {
              const img = product.imageUrls?.[0] ?? product.mainImage;
              const catalogBase = product.adminAdjustedPrice ?? product.originalPrice;
              const effectivePrice = product.isOnSale && (product.discountPercent ?? 0) > 0
                ? Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100) * 100) / 100
                : product.price;
              return (
                <div key={product.productId}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative h-40 bg-slate-50">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-200" />
                    )}
                    {product.allowCustomOrders && (
                      <span className="absolute top-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">✎</span>
                    )}
                    {product.isOnSale && (product.discountPercent ?? 0) > 0 && (
                      <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">{product.discountPercent}% OFF</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    {product.category && <p className="text-[11px] text-slate-400 truncate">{product.category}</p>}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <p className="text-base font-extrabold text-teal-600">${effectivePrice.toFixed(2)}</p>
                      {Math.abs(product.price - catalogBase) > 0.001 && (
                        <p className="text-xs text-slate-400 line-through">${catalogBase.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
