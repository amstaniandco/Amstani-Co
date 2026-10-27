"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart, Search, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "../../../../hooks/useWishlist";
import { useToast } from "../../../../components/global/ToastProvider";
import { fetchAndUpdateCartCount } from "../../../../lib/cart-events";

type Variant = { size?: string; color?: string; stock?: number; priceOverride?: number | null };

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
  isCatalogProduct?: boolean;
};

function ProductDetailModal({ product, storeId, onClose, onAdd }: {
  product: CatalogProduct;
  storeId: string;
  onClose: () => void;
  onAdd: (product: CatalogProduct, quantity: number, selectedVariants: Record<string, string>) => void;
}) {
  const imgs = [
    ...(product.images?.map((i) => i.imageUrl) ?? []),
    ...(product.imageUrls ?? []),
    ...(product.mainImage ? [product.mainImage] : []),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const [imgIdx, setImgIdx] = useState(0);

  // Carousel navigation — buttons on desktop, swipe on touch devices.
  const goPrev = () => setImgIdx((i) => Math.max(0, i - 1));
  const goNext = () => setImgIdx((i) => Math.min(imgs.length - 1, i + 1));
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const sizes = [...new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))] as string[];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.productId, storeId);
  const availableColors = selectedSize
    ? [...new Set((product.variants ?? []).filter((v) => v.size === selectedSize).map((v) => v.color).filter(Boolean))] as string[]
    : colors;
  const needsSize = sizes.length > 0;
  const needsColor = availableColors.length > 0;
  const canAdd = (!needsSize || selectedSize !== null) && (!needsColor || selectedColor !== null);
  const maxQty = currentStock ?? 0;
  const activeVariant = (selectedSize || selectedColor)
    ? product.variants?.find((v) => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor))
    : undefined;
  const displayPrice = Number(activeVariant?.priceOverride ?? product.price);
  const missing = [
    needsSize && !selectedSize ? "size" : "",
    needsColor && !selectedColor ? "color" : "",
  ].filter(Boolean).join(" and ");

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${product.productId}?storeId=${storeId}&catalog=true`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && typeof data?.product?.stock === "number") {
          setCurrentStock(data.product.stock);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStockLoading(false);
      });
    return () => { active = false; };
  }, [product.productId, storeId]);

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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto">
          {/* Images */}
          <div
            className="relative bg-slate-50 dark:bg-slate-700 h-[60vh] max-h-[460px] sm:h-96 flex-shrink-0"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {imgs[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full bg-slate-200 dark:bg-slate-600" />
            )}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  disabled={imgIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow disabled:opacity-30 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goNext}
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

          <div className="p-4 pt-5 space-y-3.5">
            {/* Title + price */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{product.name}</h2>
                {product.sku && (
                  <p className="mt-0.5 text-[11px] font-mono text-slate-400">SKU: {product.sku}</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg sm:text-xl font-extrabold text-[#68B8C1]">${displayPrice.toFixed(2)}</p>
              </div>
            </div>

            {needsSize && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Size {selectedSize === null && <span className="text-red-400 font-normal normal-case">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button key={size} type="button" onClick={() => {
                      setSelectedSize(size);
                      if (selectedColor && !availableColors.includes(selectedColor)) setSelectedColor(null);
                    }} className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${selectedSize === size ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsColor && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Color {selectedColor === null && <span className="text-red-400 font-normal normal-case">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${selectedColor === color ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700"}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {missing && <p className="text-xs font-medium text-red-500">Please select a {missing} before adding to cart.</p>}

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold">−</button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.min(maxQty || 99, value + 1))} disabled={maxQty > 0 && qty >= maxQty} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold disabled:opacity-40">+</button>
              <span className="text-xs text-slate-500">
                {stockLoading ? "Checking stock…" : maxQty > 0 ? `${maxQty} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Category / brand / custom tags */}
            {(product.category || product.brand?.name || product.allowCustomOrders) && (
              <div className="flex flex-wrap gap-1.5">
                {product.category && (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">{product.category}</span>
                )}
                {product.brand?.name && (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">{product.brand.name}</span>
                )}
                {product.allowCustomOrders && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">✎ Custom Orders</span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Link href={`/product?productId=${product.productId}&storeId=${storeId}&catalog=true`} className="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700">
                Full Details
              </Link>
              <button type="button" onClick={() => onAdd(product, qty, {
                ...(selectedSize ? { size: selectedSize } : {}),
                ...(selectedColor ? { color: selectedColor } : {}),
              })} disabled={!canAdd || stockLoading || maxQty === 0} className="flex-1 rounded-2xl bg-[#68B8C1] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <ShoppingCart className="mr-1 inline h-4 w-4" /> {stockLoading ? "Checking stock…" : "Add to Cart"}
              </button>
              <button type="button" onClick={() => void toggleWishlist({ productId: product.productId, storeId, name: product.name, sku: product.sku, price: displayPrice, mainImage: imgs[0] ?? null })} className={`rounded-2xl border px-3 ${wishlisted ? "border-red-300 text-red-500" : "border-slate-200 text-slate-500"}`} title="Add to wishlist">
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const toast = useToast();

  async function addToCart(product: CatalogProduct, quantity = 1, selectedVariants: Record<string, string> = {}) {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.productId, storeId, quantity, selectedVariants, isCatalogProduct: true }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error ?? "Could not add this product to your cart.");
      return;
    }
    toast.success("Added to cart!");
    await fetchAndUpdateCartCount();
    setSelected(null);
  }

  useEffect(() => {
    if (!storeId) return;
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
    <div data-tutorial-id="customer-store-catalog" className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={storeId ? `/store?storeId=${storeId}` : "/home"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
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
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {brands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#68B8C1] shadow-sm"
            >
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {filtered.map((product) => {
              const img = product.imageUrls?.[0] ?? product.mainImage;
              return (
                <div
                  key={product.productId}
                  className="ui-subpanel overflow-hidden rounded-3xl bg-white shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800"
                >
                  <Link
                    href={`/product?productId=${product.productId}&storeId=${storeId}&catalog=true`}
                    className="relative block aspect-[3/4] overflow-hidden bg-slate-50 dark:bg-slate-900"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="absolute inset-0 h-full w-full object-contain" />
                    ) : <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />}
                  </Link>
                  <div className="p-3 sm:p-4">
                    <Link
                      href={`/product?productId=${product.productId}&storeId=${storeId}&catalog=true`}
                      className="text-sm font-semibold leading-snug text-slate-800 hover:text-[#68B8C1] dark:text-slate-100"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs font-semibold text-[#68B8C1]">
                      {[product.brand?.name, product.category].filter(Boolean).join(" · ") || "Amstani & Co Catalog"}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleWishlist({
                            productId: product.productId,
                            storeId,
                            name: product.name,
                            sku: product.sku,
                            price: product.price,
                            mainImage: img ?? null,
                          })}
                          className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${isWishlisted(product.productId, storeId) ? "border-red-300 text-red-500" : "border-slate-200 text-slate-400"}`}
                          title="Add to wishlist"
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted(product.productId, storeId) ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#68B8C1] text-white transition hover:bg-[#4f9ea7]"
                          title="Add to cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
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

      {selected && (
        <ProductDetailModal
          product={selected}
          storeId={storeId}
          onClose={() => setSelected(null)}
          onAdd={(product, quantity, selectedVariants) => void addToCart(product, quantity, selectedVariants)}
        />
      )}
    </div>
  );
}
