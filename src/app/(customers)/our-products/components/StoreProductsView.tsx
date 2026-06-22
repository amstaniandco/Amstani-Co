"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, ChevronLeft, ChevronRight, Heart, ShoppingCart, X } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";
import { useWishlist } from "../../../../hooks/useWishlist";
import { fetchAndUpdateCartCount } from "../../../../lib/cart-events";

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop",
  pants: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=200&fit=crop",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&h=200&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop",
  jackets: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop",
  bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
  men: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=200&h=200&fit=crop",
  women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop",
  kids: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&h=200&fit=crop",
  others: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop",
};
const FALLBACK_CAT_IMG = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop";
function getCatImage(name: string) {
  return CATEGORY_IMAGES[name.toLowerCase().trim()] ?? FALLBACK_CAT_IMG;
}

type ProductVariant = {
  size?: string | number;
  color?: string;
  priceOverride?: number | null;
};

type CatalogProduct = {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  mainImage?: string | null;
  images?: string[];
  variants?: ProductVariant[];
  description?: string;
  categoryTags?: string[];
};

function isHex(str: string) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim());
}

// ── Quick-view modal (same pattern as ProductGrid) ──────────────────────────

function QuickViewModal({
  product,
  onClose,
}: {
  product: CatalogProduct;
  onClose: () => void;
}) {
  const toast = useToast();
  const backdropRef = useRef<HTMLDivElement>(null);

  const images = product.images?.length
    ? product.images
    : product.mainImage
    ? [product.mainImage]
    : [];

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
          storeId: product.storeId,
          storeName: product.storeName,
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
        toast.error("Sign in to add items to cart.");
      }
    } finally {
      setAdding(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

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
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
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
              <img src={images[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">No image</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))} disabled={imgIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow text-slate-600 hover:bg-white disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))} disabled={imgIdx === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 shadow text-slate-600 hover:bg-white disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
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
                <p className="text-xs text-[#68B8C1] font-semibold mt-0.5">{product.storeName}</p>
                {product.sku && <p className="text-xs font-mono text-slate-400 mt-0.5">{product.sku}</p>}
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

            {product.description && (
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{product.description}</p>
            )}

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

            {needsColor && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Color {selectedColor === null && <span className="text-red-400 font-normal normal-case">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) =>
                    isHex(col) ? (
                      <button key={col} onClick={() => setSelectedColor(col)} title={col}
                        style={{ backgroundColor: col }}
                        className={`h-8 w-8 rounded-full border-2 transition ${selectedColor === col ? "border-[#68B8C1] scale-110 ring-2 ring-[#68B8C1]/30" : "border-slate-200"}`} />
                    ) : (
                      <button key={col} onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${selectedColor === col ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"}`}>
                        {col}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {missingMsg && (
              <p className="text-xs text-red-500 font-medium">Please select a {missingMsg} before adding to cart.</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-600 transition hover:border-[#68B8C1] hover:text-[#68B8C1]">−</button>
              <span className="w-6 text-center text-sm font-bold text-slate-800">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-600 transition hover:border-[#68B8C1] hover:text-[#68B8C1]">+</button>
            </div>

            <div className="flex gap-3 pt-1">
              <Link
                href={`/product?productId=${product.productId}&storeId=${product.storeId}`}
                className="flex-1 text-center py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Full Details
              </Link>
              <button onClick={handleAddToCart} disabled={!canAdd || adding}
                className="flex-1 py-3 rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition">
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────────────────

export default function StoreProductsView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode: "all" | "sale" | "new-arrivals" =
    pathname === "/new-arrivals" ? "new-arrivals" : pathname === "/sale" ? "sale" : "all";

  const searchQuery = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<CatalogProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  // Sync URL → state when navigating from category strip on home page
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    let endpoint: string;
    if (mode === "sale") {
      endpoint = "/api/products/sale";
    } else if (mode === "new-arrivals") {
      endpoint = "/api/products/new-arrivals";
    } else {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      endpoint = `/api/products/all${params.toString() ? `?${params}` : ""}`;
    }
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => setAllProducts(data.products ?? []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [mode, searchQuery]);

  // Derive unique categories from the fetched products
  const categoryNames = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of allProducts) {
      for (const tag of p.categoryTags ?? []) {
        if (!seen.has(tag)) { seen.add(tag); result.push(tag); }
      }
    }
    return result;
  }, [allProducts]);

  // Client-side category filter
  const products = useMemo(() => {
    if (!selectedCategory) return allProducts;
    const lc = selectedCategory.toLowerCase();
    return allProducts.filter((p) =>
      (p.categoryTags ?? []).some((t) => t.toLowerCase() === lc)
    );
  }, [allProducts, selectedCategory]);

  function selectCategory(cat: string) {
    setSelectedCategory(cat);
    // Update URL param so the page is shareable
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  const pageTitle = mode === "sale" ? "Sale" : mode === "new-arrivals" ? "New Arrivals" : "Our Products";
  const emptyMsg =
    mode === "sale"
      ? "No sale products right now. Check back soon!"
      : mode === "new-arrivals"
      ? "No new arrivals yet."
      : selectedCategory
      ? `No products found in "${selectedCategory}".`
      : searchQuery
      ? `No products found for "${searchQuery}".`
      : "No products available yet.";

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-10 dark:bg-slate-950">
      <div className="ui-panel w-full rounded-3xl bg-gray-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border dark:border-slate-700 dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 dark:bg-slate-800">
            <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>
          <h2 className="text-xl font-semibold text-black dark:text-slate-100 sm:text-2xl">
            {pageTitle}
          </h2>
        </div>

        {/* Browse by categories — only for "all" mode with categories present */}
        {mode === "all" && !loading && categoryNames.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Browse by categories
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(selectedCategory === cat ? "" : cat)}
                  className="group relative min-w-[110px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl focus:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCatImage(cat)}
                    alt={cat}
                    className={`h-[110px] w-full object-cover transition-all duration-300 ${
                      selectedCategory === cat
                        ? "brightness-50 scale-105"
                        : "brightness-75 group-hover:brightness-90 group-hover:scale-105"
                    }`}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CAT_IMG; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {selectedCategory === cat && (
                    <div className="absolute inset-0 ring-2 ring-[#68B8C1] rounded-xl pointer-events-none" />
                  )}
                  <span className="absolute bottom-2 left-0 right-0 px-2 text-center text-[11px] font-bold text-white drop-shadow">
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {mode === "all" && !loading && categoryNames.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => selectCategory("")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                !selectedCategory
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
                onClick={() => selectCategory(selectedCategory === cat ? "" : cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
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

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
            {emptyMsg}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const img = product.images?.[0] ?? product.mainImage;

              return (
                <div
                  key={`${product.storeId}-${product.productId}`}
                  className="ui-subpanel rounded-3xl bg-white shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 overflow-hidden"
                >
                  <Link
                    href={`/product?productId=${product.productId}&storeId=${product.storeId}`}
                    className="relative block w-full h-56 overflow-hidden bg-slate-100 dark:bg-slate-900"
                  >
                    {img ? (
                      <img src={img} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                    )}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <div className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {product.discountPercent}% OFF
                      </div>
                    )}
                    {product.isNewArrival && !product.isOnSale && (
                      <div className="absolute top-2 left-2 rounded-full bg-[#68B8C1] px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link
                      href={`/product?productId=${product.productId}&storeId=${product.storeId}`}
                      className="font-semibold text-slate-800 hover:text-[#68B8C1] dark:text-slate-100 dark:hover:text-cyan-300 text-sm leading-snug"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#68B8C1] font-semibold">{product.storeName}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="ml-2 text-xs text-slate-400 line-through dark:text-slate-500">
                            ${Number(product.compareAtPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleWishlist({
                            productId: product.productId,
                            storeId: product.storeId,
                            storeName: product.storeName,
                            name: product.name,
                            sku: product.sku,
                            price: product.price,
                            mainImage: product.images?.[0] ?? product.mainImage ?? null,
                          })}
                          className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                            isWishlisted(product.productId, product.storeId)
                              ? "border-red-300 bg-red-50 text-red-500 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400"
                              : "border-gray-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                          title={isWishlisted(product.productId, product.storeId) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isWishlisted(product.productId, product.storeId) ? "currentColor" : "none"}
                            strokeWidth={1.8}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickView(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] text-white transition"
                          title="Add to cart"
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

      {quickView && (
        <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      )}
    </div>
  );
}
