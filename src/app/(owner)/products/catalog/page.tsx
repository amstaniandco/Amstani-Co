"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, Search, TrendingDown, TrendingUp, RotateCcw, RefreshCw, X } from "lucide-react";

type CatalogVariant = { id?: string; size?: string; color?: string; stock?: number; stockQuantity?: number; skuVariant?: string; priceOverride?: number | null };

type CatalogProduct = {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: { name?: string } | null;
  mainImage?: string | null;
  imageUrls?: string[];
  description?: string;
  originalPrice: number;
  adminAdjustedPrice?: number | null;
  price: number;
  discountPercent?: number;
  isOnSale?: boolean;
  totalStock?: number;
  allowCustomOrders?: boolean;
  variants?: CatalogVariant[];
};

function CatalogDetailModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.imageUrls?.length ? product.imageUrls : product.mainImage ? [product.mainImage] : [];
  // The admin-set price is the owner's base ("original") — wholesale is never shown here
  const catalogBase = product.adminAdjustedPrice ?? product.originalPrice;
  const discount = product.isOnSale && (product.discountPercent ?? 0) > 0 ? (product.discountPercent ?? 0) : 0;
  const effectivePrice = Math.round(product.price * (1 - discount / 100) * 100) / 100;
  // How much the owner has marked the product up over the catalog base (used to scale variants)
  const ownerRatio = catalogBase > 0 ? product.price / catalogBase : 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "92vh" }}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">Product Detail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-6">
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {images[activeImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[activeImage]} alt={product.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-xs text-slate-400">No image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {images.slice(0, 10).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" onClick={() => setActiveImage(i)}
                      className={`aspect-square cursor-pointer rounded-md border object-cover ${i === activeImage ? "border-[#65bbc5]" : "border-slate-200"}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xl font-bold leading-tight text-slate-900">{product.name}</h4>
                <p className="mt-0.5 text-xs text-slate-500">{product.sku || "—"} · {product.brand?.name || "No brand"}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Catalog Price</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-700">${catalogBase.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your Price</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-700">${product.price.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-teal-500">Customer Pays</p>
                  <p className="mt-0.5 text-base font-extrabold text-teal-600">${effectivePrice.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-700">{product.totalStock ?? 0} units</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {discount > 0 && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{discount}% Sale</span>}
                {product.allowCustomOrders && <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">✎ Custom Orders</span>}
                {product.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{product.category}</span>}
              </div>
            </div>
          </div>

          {product.description && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Description</p>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{product.description}</p>
            </div>
          )}

          {(product.variants?.length ?? 0) > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <p className="border-b border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">Variants</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>{["Size", "Color", "Stock", "Catalog", "Your Price", "Customer Pays"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.variants!.map((v, i) => {
                      const hasCustom = v.priceOverride != null;
                      const catalogV = hasCustom ? v.priceOverride! : null;
                      const yourV = catalogV != null ? Math.round(catalogV * ownerRatio * 100) / 100 : null;
                      const paysV = yourV != null ? Math.round(yourV * (1 - discount / 100) * 100) / 100 : null;
                      return (
                        <tr key={v.id ?? i}>
                          <td className="px-4 py-3 text-slate-700">{v.size || "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{v.color || "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{v.stock ?? v.stockQuantity ?? 0}</td>
                          <td className="px-4 py-3 text-slate-500">{catalogV != null ? `$${catalogV.toFixed(2)}` : "—"}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{yourV != null ? `$${yourV.toFixed(2)}` : "—"}</td>
                          <td className="px-4 py-3">
                            {paysV != null ? <span className="font-bold text-teal-600">${paysV.toFixed(2)}</span> : "—"}
                            {discount > 0 && paysV != null && yourV != null && paysV !== yourV && (
                              <span className="ml-1.5 text-[10px] font-semibold text-amber-500">{discount}% OFF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OwnerCatalogPage() {
  const [products,      setProducts]      = useState<CatalogProduct[]>([]);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [discountCap,   setDiscountCap]   = useState(20);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);

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

  // Re-fetch the catalog. The GET endpoint syncs any new admin products
  // into this store's catalog, so this pulls in the latest additions.
  async function refreshCatalog() {
    setRefreshing(true);
    setMsg(null);
    try {
      const before = products.length;
      const data = await fetch("/api/owner/catalog").then((r) => r.json());
      const next = data.products ?? [];
      setProducts(next);
      setMarkupPercent(data.markupPercent ?? 20);
      setDiscountCap(data.discountCap ?? 20);
      const added = next.length - before;
      setMsg({
        ok: true,
        text: added > 0
          ? `Fetched ${added} new product${added === 1 ? "" : "s"} from the catalog.`
          : "Catalog is up to date.",
      });
    } finally {
      setRefreshing(false);
    }
  }

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
          <button
            onClick={refreshCatalog}
            disabled={loading || refreshing}
            title="Fetch the latest products added to the catalog"
            className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Fetching…" : "Fetch Latest"}
          </button>
        </div>

        {/* ── Bulk pricing panel ── */}
        <div data-tutorial-id="owner-catalog-bulk-pricing" className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
          <div data-tutorial-id="owner-catalog-grid" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((product) => {
              const img = product.imageUrls?.[0] ?? product.mainImage;
              const catalogBase = product.adminAdjustedPrice ?? product.originalPrice;
              const effectivePrice = product.isOnSale && (product.discountPercent ?? 0) > 0
                ? Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100) * 100) / 100
                : product.price;
              return (
                <button key={product.productId} type="button" onClick={() => setDetailProduct(product)}
                  className="group text-left overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
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
                    <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow transition group-hover:opacity-100">
                      <Eye className="h-3.5 w-3.5" />
                    </span>
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      {detailProduct && <CatalogDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />}
    </div>
  );
}
