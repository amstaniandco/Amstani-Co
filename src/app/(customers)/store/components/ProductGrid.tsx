"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";

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
          storeId,
          storeName,
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
                <p className="text-xl font-extrabold text-slate-900">${Number(product.price).toFixed(2)}</p>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <p className="text-xs text-slate-400 line-through">${Number(product.compareAtPrice).toFixed(2)}</p>
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
                    <button
                      key={String(sz)}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${
                        selectedSize === sz
                          ? "border-[#68B8C1] bg-[#68B8C1] text-white"
                          : "border-slate-200 text-slate-700 hover:border-[#68B8C1]"
                      }`}
                    >
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
                  {colors.map((col) => (
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

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Link
                href={`/product?productId=${product.productId}&storeId=${storeId}`}
                className="flex-1 text-center py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Full Details
              </Link>
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || adding}
                className="flex-1 py-3 rounded-2xl bg-[#68B8C1] hover:bg-[#4f9ea7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
              >
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            </div>
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

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="py-12 text-center text-sm text-slate-400">Loading products…</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[#5fb9c3]">📦</span>
          <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
        </div>
        <div className="py-8 text-center text-sm text-slate-400">No products listed yet.</div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[#5fb9c3]">📦</span>
          <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const imgs = normalizeImages(product);

            return (
              <div
                key={product.productId}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                {/* Image — click → product page (same as before) */}
                <Link
                  href={`/product?productId=${product.productId}&storeId=${storeId}`}
                  className="relative block h-[300px] w-full overflow-hidden bg-white dark:bg-slate-900"
                >
                  {imgs[0] ? (
                    <img src={imgs[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                  )}
                  {product.isOnSale && product.discountPercent && (
                    <div className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {product.discountPercent}% OFF
                    </div>
                  )}
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
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                      {product.quantity} in stock
                    </span>
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
                      <Link
                        href="/wishlist"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-500 transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12.1 21.55l-.1.1-.11-.1C7.14 17.24 4 14.39 4 10.5 4 7.42 6.42 5 9.5 5c1.74 0 3.41.81 4.5 2.09C15.09 5.81 16.76 5 18.5 5 21.58 5 24 7.42 24 10.5c0 3.89-3.14 6.74-7.9 11.05z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                      {/* Cart button → opens quick view, never adds directly */}
                      <button
                        type="button"
                        onClick={() => setQuickView(product)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#68B8C1] text-white transition hover:bg-[#4f9ea7]"
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
              </div>
            );
          })}
        </div>
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
    </>
  );
}
