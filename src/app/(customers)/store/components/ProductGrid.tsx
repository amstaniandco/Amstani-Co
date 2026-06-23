"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, X } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";
import { useWishlist } from "../../../../hooks/useWishlist";
import { useCategoryImages, FALLBACK_CATEGORY_IMAGE } from "../../../../hooks/useCategoryImages";
import { fetchAndUpdateCartCount } from "../../../../lib/cart-events";

const FALLBACK_CAT_IMG = FALLBACK_CATEGORY_IMAGE;

type ProductVariant = {
  size?: string | number;
  color?: string;
  stock?: number;
  priceOverride?: number | null;
};

type RawImage = string | { url?: string; imageUrl?: string };

type StoreProduct = {
  productId: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  mainImage?: string | null;
  images?: RawImage[];
  variants?: ProductVariant[];
  description?: string;
  quantity: number;
  discountPercent?: number;
  isOnSale?: boolean;
  categoryTags?: string[];
};

function normalizeImages(product: StoreProduct): string[] {
  const all: string[] = [];
  if (product.images?.length) {
    for (const img of product.images) {
      const src = typeof img === "string" ? img : img.url ?? img.imageUrl ?? "";
      if (src) all.push(src);
    }
  }
  if (all.length === 0 && product.mainImage) all.push(product.mainImage);
  return all;
}

function isHex(str: string) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim());
}

// ── Quick-view modal ────────────────────────────────────────────────────────

function QuickViewModal({
  product,
  storeId,
  storeName,
  onClose,
}: {
  product: StoreProduct;
  storeId: string;
  storeName: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const backdropRef = useRef<HTMLDivElement>(null);

  const images = normalizeImages(product);
  const [imgIdx, setImgIdx] = useState(0);

  const sizes = product.variants
    ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as (string | number)[]
    : [];
  const colors = product.variants
    ? [...new Set(product.variants.map((v) => v.color).filter(Boolean).map(String))]
    : [];

  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const availableColors: string[] = selectedSize != null
    ? [...new Set(
        (product.variants ?? [])
          .filter((v) => v.size != null && String(v.size) === String(selectedSize))
          .map((v) => v.color)
          .filter(Boolean)
          .map(String)
      )]
    : colors;

  function handleSizeSelect(size: string | number) {
    setSelectedSize(size);
    setQty(1);
    const colorsForSize = (product.variants ?? [])
      .filter((v) => v.size != null && String(v.size) === String(size))
      .map((v) => v.color).filter(Boolean).map(String);
    if (selectedColor && !colorsForSize.includes(selectedColor)) setSelectedColor(null);
  }

  const needsSize = sizes.length > 0;
  const needsColor = availableColors.length > 0;
  const canAdd = (!needsSize || selectedSize !== null) && (!needsColor || selectedColor !== null);

  const missingMsg = !canAdd
    ? [needsSize && selectedSize === null ? "size" : "", needsColor && selectedColor === null ? "color" : ""]
        .filter(Boolean)
        .join(" and ")
    : "";

  // Dynamic price based on selected variant
  const storeDiscount: number = (product.isOnSale && (product.discountPercent ?? 0) > 0) ? (product.discountPercent ?? 0) : 0;
  const activeVariant = (selectedSize != null || selectedColor != null)
    ? (product.variants ?? []).find((v) => {
        const sizeMatch = selectedSize == null || String(v.size) === String(selectedSize);
        const colorMatch = selectedColor == null || v.color === selectedColor;
        return sizeMatch && colorMatch;
      }) ?? null
    : null;
  const rawVariantPrice = activeVariant?.priceOverride ?? null;
  const discountedVariantPrice = rawVariantPrice != null
    ? Math.round(rawVariantPrice * (1 - storeDiscount / 100) * 100) / 100
    : null;
  const displayPrice = discountedVariantPrice ?? product.price;
  const variantCompareAtPrice = discountedVariantPrice != null && storeDiscount > 0 ? rawVariantPrice : null;

  async function handleAddToCart() {
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
          price: displayPrice,
          mainImage: images[0] ?? null,
          quantity: qty,
          selectedVariants: {
            ...(selectedSize !== null ? { size: String(selectedSize) } : {}),
            ...(selectedColor ? { color: selectedColor } : {}),
          },
        }),
      });
      if (res.ok) {
        toast.success("Added to cart!");
        fetchAndUpdateCartCount();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Could not add to cart.");
      }
    } finally {
      setAdding(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto">
          {/* Image carousel */}
          <div className="relative bg-slate-50 h-64 sm:h-80 flex-shrink-0">
            {images.length > 0 ? (
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
                No image
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow text-slate-600 hover:bg-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
                  disabled={imgIdx === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow text-slate-600 hover:bg-white disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-[#68B8C1]" : "w-1.5 bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 space-y-4">
            {/* Name + price */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">{product.name}</h2>
                {product.sku && (
                  <p className="mt-0.5 text-xs font-mono uppercase tracking-widest text-slate-400">{product.sku}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-extrabold text-slate-900">${Number(displayPrice).toFixed(2)}</p>
                {variantCompareAtPrice != null ? (
                  <p className="text-xs text-slate-400 line-through">${Number(variantCompareAtPrice).toFixed(2)}</p>
                ) : product.compareAtPrice && product.compareAtPrice > product.price ? (
                  <p className="text-xs text-slate-400 line-through">${Number(product.compareAtPrice).toFixed(2)}</p>
                ) : null}
                {storeDiscount > 0 && (
                  <p className="text-[10px] font-bold text-amber-600">{storeDiscount}% OFF</p>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{product.description}</p>
            )}

            {/* Size selector */}
            {needsSize && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Size {selectedSize === null && <span className="text-red-400 font-normal normal-case">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button key={String(sz)} onClick={() => handleSizeSelect(sz)}
                      className={`min-w-[2.5rem] rounded-xl border px-3 py-1.5 text-sm font-semibold transition text-left break-words ${selectedSize === sz ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#68B8C1]"}`}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {needsColor && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Color {selectedColor === null && <span className="text-red-400 font-normal normal-case">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => (
                    isHex(col) ? (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        title={col}
                        style={{ backgroundColor: col }}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          selectedColor === col ? "border-[#68B8C1] scale-110 ring-2 ring-[#68B8C1]/30" : "border-slate-200"
                        }`}
                      />
                    ) : (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${
                          selectedColor === col
                            ? "border-[#68B8C1] bg-[#68B8C1] text-white"
                            : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"
                        }`}
                      >
                        {col}
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Validation hint */}
            {missingMsg && (
              <p className="text-xs text-red-500 font-medium">
                Please select a {missingMsg} before adding to cart.
              </p>
            )}

            {/* Quantity + Actions */}
            {(() => {
              const maxQty = product.quantity > 0 ? product.quantity : 0;
              return (
                <>
                  {maxQty > 0 && (
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-600 transition hover:border-[#68B8C1] hover:text-[#68B8C1]">−</button>
                      <span className="w-6 text-center text-sm font-bold text-slate-800">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-600 transition hover:border-[#68B8C1] hover:text-[#68B8C1] disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                      <span className="text-xs text-slate-400">{maxQty} in stock</span>
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <Link
                      href={`/product?productId=${product.productId}&storeId=${storeId}`}
                      className="flex-1 text-center py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Full Details
                    </Link>
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAdd || adding || maxQty === 0}
                      className="flex-1 py-3 rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
                    >
                      {adding ? "Adding…" : maxQty === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getProductCategories(product: StoreProduct): string[] {
  return product.categoryTags ?? [];
}

// ── All Categories Modal ─────────────────────────────────────────────────────

function AllCategoriesModal({
  categoryNames,
  selectedCategory,
  onSelect,
  onClose,
}: {
  categoryNames: string[];
  selectedCategory: string | null;
  onSelect: (cat: string) => void;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { getCategoryImage: getCatImage } = useCategoryImages();

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Categories</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { onSelect(cat); onClose(); }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCatImage(cat)}
                  alt={cat}
                  className={`h-[150px] w-full object-cover transition-all duration-300 ${
                    selectedCategory === cat
                      ? "brightness-50 scale-105"
                      : "brightness-90 group-hover:brightness-100 group-hover:scale-105"
                  }`}
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CAT_IMG; }}
                />
                {selectedCategory === cat && (
                  <div className="absolute inset-0 ring-2 ring-[#68B8C1] rounded-2xl pointer-events-none" />
                )}
                <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#68B8C1]/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ProductGrid ────────────────────────────────────────────────────────

export default function ProductGrid({ storeId, storeName = "" }: { storeId?: string | null; storeName?: string }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(Boolean(storeId));
  const [quickView, setQuickView] = useState<StoreProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { getCategoryImage: getCatImage } = useCategoryImages();

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  // Derive unique categories from the actual products
  const categoryNames = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of products) {
      for (const name of getProductCategories(p)) {
        if (!seen.has(name)) { seen.add(name); result.push(name); }
      }
    }
    return result;
  }, [products]);

  // Reset filter when products change
  useEffect(() => { setSelectedCategory(null); }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) =>
      getProductCategories(p).includes(selectedCategory)
    );
  }, [products, selectedCategory]);

  // ── Catalog banner — always shown; it links to the global catalog, not the store's own products ──
  const catalogBanner = (
    <Link href={storeId ? `/store/catalog?storeId=${storeId}` : "/store/catalog"}
      className="mt-5 rounded-2xl bg-white shadow-lg dark:border dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center py-5 hover:bg-slate-50 dark:hover:bg-slate-700 transition group">
      <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase group-hover:text-[#68B8C1] transition-colors" style={{ WebkitTextStroke: "1px currentColor" }}>
        Amstani &amp; Co&apos;s Catalog
      </p>
    </Link>
  );

  if (loading) {
    return (
      <>
        {catalogBanner}
        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
          <div className="py-12 text-center text-sm text-slate-400">Loading products…</div>
        </div>
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        {catalogBanner}
        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[#5fb9c3]">📦</span>
            <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
          </div>
          <div className="py-8 text-center text-sm text-slate-400">No products listed yet.</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── Catalog banner ───────────────────────────────────────────────── */}
      {catalogBanner}

      {/* ── Browse by categories ─────────────────────────────────────────── */}
      {categoryNames.length > 0 && (
        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              Browse by categories
            </h3>
            {categoryNames.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllCats(true)}
                className="text-xs font-semibold text-[#68B8C1] hover:text-[#4f9ea7] transition"
              >
                View all ({categoryNames.length})
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-8">
            {categoryNames.slice(0, 4).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCatImage(cat)}
                  alt={cat}
                  className={`aspect-[3/2] w-full object-cover transition-all duration-300 ${
                    selectedCategory === cat
                      ? "brightness-50 scale-105"
                      : "brightness-90 group-hover:brightness-100 group-hover:scale-105"
                  }`}
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CAT_IMG; }}
                />
                {selectedCategory === cat && (
                  <div className="absolute inset-0 ring-2 ring-[#68B8C1] rounded-2xl pointer-events-none" />
                )}
                <span className="absolute bottom-3 right-3 rounded-full bg-[#68B8C1]/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Products section ─────────────────────────────────────────────── */}
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        {/* Header row */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#5fb9c3]">📦</span>
            <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
          </div>

          {/* Filter tabs */}
          {categoryNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedCategory === null
                    ? "bg-[#68B8C1] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                All Products
              </button>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-[#68B8C1] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No products in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const imgs = normalizeImages(product);
              const outOfStock = (product.quantity ?? 0) <= 0;

              return (
                <div
                  key={product.productId}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Image */}
                  <Link
                    href={`/product?productId=${product.productId}&storeId=${storeId}`}
                    className="relative block h-[300px] w-full overflow-hidden bg-white dark:bg-slate-900"
                  >
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={product.name} className={`h-full w-full object-cover ${outOfStock ? "opacity-50 grayscale" : ""}`} />
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                    )}
                    {outOfStock ? (
                      <div className="absolute top-2 left-2 rounded-full bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        Out of Stock
                      </div>
                    ) : product.isOnSale && product.discountPercent ? (
                      <div className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {product.discountPercent}% OFF
                      </div>
                    ) : null}
                  </Link>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/product?productId=${product.productId}&storeId=${storeId}`}
                          className="text-sm font-semibold text-[#68B8C1] hover:text-[#4f9ea7]"
                        >
                          {product.name}
                        </Link>
                        {product.sku && (
                          <p className="mt-1 text-xs font-mono uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                            {product.sku}
                          </p>
                        )}
                      </div>
                      {outOfStock ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 dark:bg-red-500/10 dark:text-red-400">
                          Out of stock
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                          {product.quantity} in stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <p className="text-xs text-slate-400 line-through">${Number(product.compareAtPrice).toFixed(2)}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleWishlist({
                            productId: product.productId,
                            storeId: storeId ?? "",
                            storeName,
                            name: product.name,
                            sku: product.sku,
                            price: product.price,
                            mainImage: normalizeImages(product)[0] ?? null,
                          })}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                            isWishlisted(product.productId, storeId ?? "")
                              ? "border-red-300 bg-red-50 text-red-500 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400"
                              : "border-gray-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-red-400"
                          }`}
                          title={isWishlisted(product.productId, storeId ?? "") ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isWishlisted(product.productId, storeId ?? "") ? "currentColor" : "none"}
                            strokeWidth={1.8}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => !outOfStock && setQuickView(product)}
                          disabled={outOfStock}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white transition ${outOfStock ? "bg-slate-300 cursor-not-allowed dark:bg-slate-700" : "bg-[#68B8C1] hover:bg-[#4f9ea7]"}`}
                          title={outOfStock ? "Out of stock" : "Add to cart"}
                        >
                          <ShoppingCart className="w-4 h-4" strokeWidth={1.8} />
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

      {/* Quick-view modal */}
      {quickView && storeId && (
        <QuickViewModal
          product={quickView}
          storeId={storeId}
          storeName={storeName}
          onClose={() => setQuickView(null)}
        />
      )}

      {/* All categories modal */}
      {showAllCats && (
        <AllCategoriesModal
          categoryNames={categoryNames}
          selectedCategory={selectedCategory}
          onSelect={(cat) => setSelectedCategory(selectedCategory === cat ? null : cat)}
          onClose={() => setShowAllCats(false)}
        />
      )}
    </>
  );
}
