"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, X } from "lucide-react";

type CatalogProduct = {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: { name?: string } | null;
  mainImage?: string | null;
  imageUrls?: string[];
  originalPrice: number;
  price: number;
  totalStock?: number;
  description?: string;
  variants?: Array<{ size?: string; color?: string; stock?: number }>;
  allowCustomOrders?: boolean;
};

function ProductDetailModal({ product, markupPercent, onPriceUpdated, onClose }: {
  product: CatalogProduct;
  markupPercent: number;
  onPriceUpdated: (productId: string, price: number) => void;
  onClose: () => void;
}) {
  const [priceInput, setPriceInput] = useState(product.price.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const maxPrice = product.originalPrice * (1 + markupPercent / 100);
  const imgs = product.imageUrls?.length ? product.imageUrls : product.mainImage ? [product.mainImage] : [];
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  async function savePrice() {
    const p = parseFloat(priceInput);
    if (isNaN(p) || p < 0) { setError("Enter a valid price."); return; }
    if (p > maxPrice) { setError(`Max allowed: $${maxPrice.toFixed(2)}`); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/owner/catalog/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: p }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      onPriceUpdated(product.productId, p);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        {imgs.length > 0 ? (
          <div className="relative h-56 bg-slate-50 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            {imgs.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {imgs.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-[#68B8C1]" : "w-1.5 bg-slate-300"}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 bg-slate-100 flex-shrink-0" />
        )}

        <div className="overflow-y-auto p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{product.name}</h2>
            {product.sku && <p className="text-xs font-mono text-slate-400 mt-0.5">{product.sku}</p>}
            <div className="mt-1 flex flex-wrap gap-2">
              {product.category && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{product.category}</span>}
              {product.brand?.name && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{product.brand.name}</span>}
              {product.allowCustomOrders && <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">✎ Custom Orders</span>}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          )}

          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Variants</p>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((v, i) => (
                  <span key={i} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600">
                    {[v.size, v.color].filter(Boolean).join(" / ") || "—"}
                    {v.stock != null && <span className="ml-1 text-slate-400">({v.stock})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Catalog Price</p>
                <p className="text-base font-bold text-slate-700 mt-0.5">${product.originalPrice.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">max ${maxPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-teal-500">Your Price</p>
                <p className="text-base font-extrabold text-teal-600 mt-0.5">${product.price.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1.5">Set your price</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input type="number" min="0" max={maxPrice} step="0.01" value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <button onClick={savePrice} disabled={saving}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold disabled:opacity-60 transition">
                  {saving ? "…" : "Save"}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    fetch("/api/owner/catalog")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setMarkupPercent(data.markupPercent ?? 20);
      })
      .finally(() => setLoading(false));
  }, []);

  function handlePriceUpdated(productId: string, price: number) {
    setProducts((prev) => prev.map((p) => p.productId === productId ? { ...p, price } : p));
    setSelected((prev) => prev?.productId === productId ? { ...prev, price } : prev);
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
        <div className="mb-6 flex items-center gap-3">
          <Link href="/products" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Amstani &amp; Co&apos;s Catalog
            </h1>
            {!loading && <p className="text-sm text-slate-500 mt-0.5">{products.length} products · set your own prices</p>}
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm" />
        </div>

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
              return (
                <button key={product.productId} type="button" onClick={() => setSelected(product)}
                  className="group text-left overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                  <div className="relative h-40 bg-slate-50">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full w-full bg-slate-200" />
                    )}
                    {product.allowCustomOrders && (
                      <span className="absolute top-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">✎</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    {product.category && <p className="text-[11px] text-slate-400 truncate">{product.category}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-base font-extrabold text-teal-600">${product.price.toFixed(2)}</p>
                      {product.price !== product.originalPrice && (
                        <p className="text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <ProductDetailModal
          product={selected}
          markupPercent={markupPercent}
          onPriceUpdated={handlePriceUpdated}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
