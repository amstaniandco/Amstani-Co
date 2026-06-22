"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";
import { useWishlist } from "../../../../hooks/useWishlist";

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

function QuickViewModal({ product, storeId, storeName, onClose }: {
  product: CatalogProduct;
  storeId: string;
  storeName: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const imgs = [
    ...(product.images?.map((i) => i.imageUrl) ?? []),
    ...(product.imageUrls ?? []),
    ...(product.mainImage ? [product.mainImage] : []),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const [imgIdx, setImgIdx] = useState(0);
  const sizes = [...new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))] as string[];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const canAdd = (!sizes.length || selectedSize) && (!colors.length || selectedColor);

  async function addToCart() {
    if (!canAdd) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.productId,
          storeId,
          storeName,
          name: product.name,
          sku: product.sku ?? "",
          price: product.price,
          mainImage: imgs[0] ?? null,
          quantity: 1,
          selectedVariants: {
            ...(selectedSize ? { size: selectedSize } : {}),
            ...(selectedColor ? { color: selectedColor } : {}),
          },
        }),
      });
      if (res.ok) { toast.success("Added to cart!"); onClose(); }
      else toast.error("Sign in to add items to cart.");
    } finally { setAdding(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
          <X className="h-4 w-4" />
        </button>
        <div className="overflow-y-auto">
          {/* Image */}
          <div className="relative bg-slate-50 h-64 sm:h-80">
            {imgs[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full bg-slate-200" />
            )}
            {imgs.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))} disabled={imgIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))} disabled={imgIdx === imgs.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {imgs.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-[#68B8C1]" : "w-1.5 bg-white/60"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{product.name}</h2>
                {product.sku && <p className="text-xs font-mono text-slate-400 mt-0.5">{product.sku}</p>}
              </div>
              <p className="text-xl font-extrabold text-slate-900 flex-shrink-0">${product.price.toFixed(2)}</p>
            </div>
            {product.description && <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{product.description}</p>}
            {sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button key={sz} onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${selectedSize === sz ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"}`}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((col) => isHex(col) ? (
                    <button key={col} onClick={() => setSelectedColor(col)} title={col}
                      style={{ backgroundColor: col }}
                      className={`h-8 w-8 rounded-full border-2 transition ${selectedColor === col ? "border-[#68B8C1] scale-110 ring-2 ring-[#68B8C1]/30" : "border-slate-200"}`} />
                  ) : (
                    <button key={col} onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${selectedColor === col ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"}`}>
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Link href={`/product?productId=${product.productId}&storeId=${storeId}`}
                className="flex-1 text-center py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Full Details
              </Link>
              <button onClick={addToCart} disabled={!canAdd || adding}
                className="flex-1 py-3 rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] disabled:opacity-50 text-white text-sm font-semibold transition">
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            </div>
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
  const [quickView, setQuickView] = useState<CatalogProduct | null>(null);
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

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

  const filtered = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
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
          <Link href={storeId ? `/store?storeId=${storeId}` : "/home"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition flex-shrink-0">
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
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm" />
          </div>
          {categories.length > 0 && (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
              const wishlisted = isWishlisted(product.productId, storeId);
              return (
                <div key={product.productId}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                  <Link href={`/product?productId=${product.productId}&storeId=${storeId}`}
                    className="relative block h-48 bg-white overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-slate-200" />
                    )}
                    {product.allowCustomOrders && (
                      <span className="absolute top-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">✎ Custom</span>
                    )}
                  </Link>
                  <div className="p-3 space-y-2">
                    <Link href={`/product?productId=${product.productId}&storeId=${storeId}`}
                      className="text-sm font-semibold text-[#68B8C1] hover:text-[#4f9ea7] line-clamp-1 block">
                      {product.name}
                    </Link>
                    {product.category && <p className="text-[11px] text-slate-400">{product.category}</p>}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-extrabold text-slate-900">${product.price.toFixed(2)}</p>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => toggleWishlist({ productId: product.productId, storeId, storeName, name: product.name, price: product.price, mainImage: img ?? null })}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:text-red-400"}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"}>
                            <path d="M12.1 21.55l-.1.1-.11-.1C7.14 17.24 4 14.39 4 10.5 4 7.42 6.42 5 9.5 5c1.74 0 3.41.81 4.5 2.09C15.09 5.81 16.76 5 18.5 5 21.58 5 24 7.42 24 10.5c0 3.89-3.14 6.74-7.9 11.05z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setQuickView(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#68B8C1] text-white hover:bg-[#4f9ea7] transition">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6h.01M6 6l1.5 9.3a1 1 0 001 .92h9a1 1 0 001-.92L18 6H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 6V4a2 2 0 114 0v2m4 0V4a2 2 0 114 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {quickView && (
        <QuickViewModal product={quickView} storeId={storeId} storeName={storeName} onClose={() => setQuickView(null)} />
      )}
    </div>
  );
}
