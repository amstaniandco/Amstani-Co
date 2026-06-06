"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";

type ProductVariant = {
  size?: string | number;
  color?: string;
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
  const [adding, setAdding] = useState(false);

  const needsSize = sizes.length > 0;
  const needsColor = colors.length > 0;
  const canAdd = (!needsSize || selectedSize !== null) && (!needsColor || selectedColor !== null);

  const missingMsg = !canAdd
    ? [needsSize && selectedSize === null ? "size" : "", needsColor && selectedColor === null ? "color" : ""]
        .filter(Boolean)
        .join(" and ")
    : "";

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
          price: product.price,
          mainImage: images[0] ?? null,
          quantity: 1,
          selectedVariants: {
            ...(selectedSize !== null ? { size: String(selectedSize) } : {}),
            ...(selectedColor ? { color: selectedColor } : {}),
          },
        }),
      });
      if (res.ok) {
        toast.success("Added to cart!");
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
                <p className="text-xl font-extrabold text-slate-900">${Number(product.price).toFixed(2)}</p>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <p className="text-xs text-slate-400 line-through">${Number(product.compareAtPrice).toFixed(2)}</p>
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
                    <button key={String(sz)} onClick={() => setSelectedSize(sz)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${selectedSize === sz ? "border-[#68B8C1] bg-[#68B8C1] text-white" : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"}`}>
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
                  {colors.map((col) =>
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
  const mode: "all" | "sale" | "new-arrivals" =
    pathname === "/new-arrivals" ? "new-arrivals" : pathname === "/sale" ? "sale" : "all";

  const searchQuery = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    let endpoint: string;
    if (mode === "sale") {
      endpoint = "/api/products/sale";
    } else if (mode === "new-arrivals") {
      endpoint = "/api/products/new-arrivals";
    } else {
      endpoint = searchQuery
        ? `/api/products/all?q=${encodeURIComponent(searchQuery)}`
        : "/api/products/all";
    }
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [mode, searchQuery]);

  const pageTitle = mode === "sale" ? "Sale" : mode === "new-arrivals" ? "New Arrivals" : "All Products";
  const pageIcon = mode === "sale" ? "" : mode === "new-arrivals" ? "" : "";
  const emptyMsg =
    mode === "sale"
      ? "No sale products right now. Check back soon!"
      : mode === "new-arrivals"
      ? "No new arrivals yet. Store owners can tag their products as New Arrivals."
      : searchQuery
      ? `No products found for "${searchQuery}".`
      : "No products available yet.";

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-10 dark:bg-slate-950">
      <div className="ui-panel w-full rounded-3xl bg-gray-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 dark:bg-slate-800">
            <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>
          <h2 className="text-xl font-semibold text-black dark:text-slate-100 sm:text-2xl">
            {pageIcon} {pageTitle}
          </h2>
        </div>

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
                  {/* Image → product page */}
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
                    {/* Name + store */}
                    <Link
                      href={`/product?productId=${product.productId}&storeId=${product.storeId}`}
                      className="font-semibold text-slate-800 hover:text-[#68B8C1] dark:text-slate-100 dark:hover:text-cyan-300 text-sm leading-snug"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#68B8C1] font-semibold">{product.storeName}</p>

                    {/* Price row + cart */}
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

                      {/* Cart button → quick-view popup */}
                      <button
                        type="button"
                        onClick={() => setQuickView(product)}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] text-white transition flex-shrink-0"
                        title="Add to cart"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6h.01M6 6l1.5 9.3a1 1 0 001 .92h9a1 1 0 001-.92L18 6H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6V4a2 2 0 114 0v2m4 0V4a2 2 0 114 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
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
