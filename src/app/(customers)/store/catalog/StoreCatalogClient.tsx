"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

type Variant = { size?: string; color?: string; stock?: number };

type CatalogProduct = {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: { name?: string } | null;
  mainImage?: string | null;
  imageUrls?: string[];
  images?: Array<{ imageUrl: string }>;
  originalPrice: number;
  price: number;
  totalStock?: number;
  description?: string;
  variants?: Variant[];
  allowCustomOrders?: boolean;
};

function isHex(s: string) { return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s.trim()); }

function ProductDetailModal({ product, onClose }: {
  product: CatalogProduct;
  onClose: () => void;
}) {
  const imgs = [
    ...(product.images?.map((i) => i.imageUrl) ?? []),
    ...(product.imageUrls ?? []),
    ...(product.mainImage ? [product.mainImage] : []),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const [imgIdx, setImgIdx] = useState(0);

  const sizes = [...new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))] as string[];

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 hover:bg-slate-100 text-slate-600 shadow transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto">
          {/* Images */}
          <div className="relative bg-slate-50 h-64 sm:h-80 flex-shrink-0">
            {imgs[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full bg-slate-200" />
            )}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow disabled:opacity-30 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))}
                  disabled={imgIdx === imgs.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow disabled:opacity-30 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Thumbnail strip */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4">
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-6 bg-[#68B8C1]" : "w-1.5 bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail row */}
          {imgs.length > 1 && (
            <div className="flex gap-2 px-5 pt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${i === imgIdx ? "border-[#68B8C1]" : "border-slate-200"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-5 space-y-5">
            {/* Title + price */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h2>
                {product.sku && (
                  <p className="mt-0.5 text-xs font-mono text-slate-400">SKU: {product.sku}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.category && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{product.category}</span>
                  )}
                  {product.brand?.name && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{product.brand.name}</span>
                  )}
                  {product.allowCustomOrders && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">✎ Custom Orders</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-extrabold text-slate-900">${product.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <span key={sz} title={sz} className="inline-block max-w-[80px] truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((col) => isHex(col) ? (
                    <span key={col} title={col} style={{ backgroundColor: col }}
                      className="h-8 w-8 rounded-full border border-slate-200 shadow-sm" />
                  ) : (
                    <span key={col} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* All variants table if any */}
            {product.variants && product.variants.length > 0 && sizes.length === 0 && colors.length === 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Variants</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v, i) => (
                    <span key={i} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                      {[v.size, v.color].filter(Boolean).join(" / ") || "—"}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreCatalogClient() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    if (!storeId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/stores/${storeId}/catalog`).then((r) => r.json()),
      fetch(`/api/stores?storeId=${storeId}`).then((r) => r.json()),
    ]).then(([catData, storeData]) => {
      setProducts(catData.products ?? []);
      setStoreName(storeData.store?.name ?? storeData.stores?.[0]?.name ?? "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, [storeId]);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
  const brands = [...new Set(products.map((p) => p.brand?.name).filter(Boolean))] as string[];

  const filtered = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedBrand && p.brand?.name !== selectedBrand) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={storeId ? `/store?storeId=${storeId}` : "/home"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Amstani &amp; Co&apos;s Catalog
            </h1>
            {storeName && <p className="text-sm text-slate-500 mt-0.5">{storeName}</p>}
          </div>
        </div>

        {/* Search + filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {brands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            >
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="h-48 bg-slate-200" />
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
                <button
                  key={product.productId}
                  type="button"
                  onClick={() => setSelected(product)}
                  className="group text-left overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
                >
                  <div className="relative h-48 bg-white overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-slate-200" />
                    )}
                    {product.allowCustomOrders && (
                      <span className="absolute top-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">✎ Custom</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    {product.category && <p className="text-[11px] text-slate-400 truncate">{product.category}</p>}
                    <p className="mt-2 text-base font-extrabold text-slate-900">${product.price.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
