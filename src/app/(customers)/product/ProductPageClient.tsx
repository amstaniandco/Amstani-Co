"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "../../../components/global/ToastProvider";
import { useWishlist } from "../../../hooks/useWishlist";

type Review = {
  _id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

type ProductImage = string | { url?: string; imageUrl?: string };

type ProductVariant = {
  size?: string | number;
  color?: string;
};

type ProductDetail = {
  name: string;
  sku?: string;
  price: number;
  description?: string;
  mainImage?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  storeName?: string;
  brand?: { name?: string };
  category?: string;
  categories?: Array<{ category: { name: string; slug?: string }; isPrimary?: boolean }>;
  isCustomOrderEnabled?: boolean;
};

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (s: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} ${star <= (hovered || rating) ? "text-amber-400" : "text-gray-300"}`}
        >★</button>
      ))}
    </div>
  );
}

function RatingBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 font-medium dark:text-slate-400">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-8 text-right text-gray-400 text-xs dark:text-slate-500">{percent}%</span>
    </div>
  );
}

export default function ProductPageClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? "";
  const storeId = searchParams.get("storeId") ?? "";
  const toast = useToast();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewBreakdown, setReviewBreakdown] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  const [cartMsg, setCartMsg] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  // Custom order modal state
  const [customOrderOpen, setCustomOrderOpen] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [customMediaFiles, setCustomMediaFiles] = useState<File[]>([]);
  const [customMediaPreviews, setCustomMediaPreviews] = useState<string[]>([]);
  const [customOrderSubmitting, setCustomOrderSubmitting] = useState(false);
  const [customOrderMsg, setCustomOrderMsg] = useState("");

  useEffect(() => {
    if (!productId) { setProductLoading(false); return; }
    const url = storeId ? `/api/products/${productId}?storeId=${storeId}` : `/api/products/${productId}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setProduct(d.product ?? null))
      .catch(() => {})
      .finally(() => setProductLoading(false));
  }, [productId, storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setReviewAvg(d.avg ?? 0);
        setReviewTotal(d.total ?? 0);
        setReviewBreakdown(d.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      })
      .catch(() => {});
  }, [storeId]);

  useEffect(() => {
    if (!productId || !storeId) return;
    fetch(`/api/products/${productId}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    }).catch(() => {});
  }, [productId, storeId]);

  const images: string[] = product?.images?.length
    ? product.images.map((img) => (typeof img === "string" ? img : img.url ?? img.imageUrl ?? "")).filter(Boolean)
    : product?.mainImage
    ? [product.mainImage]
    : [];

  const sizes: (string | number)[] = product?.variants
    ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as (string | number)[]
    : [];

  const colors: string[] = product?.variants
    ? [...new Set(product.variants.map((v) => v.color).filter(Boolean).map((color) => String(color)))]
    : [];

  const canAddToCart =
    (!sizes.length || selectedSize !== null) &&
    (!colors.length || selectedColor !== null);

  const missingVariant = sizes.length > 0 && selectedSize === null
    ? "size"
    : colors.length > 0 && selectedColor === null
    ? "color"
    : null;

  async function handleAddToCart() {
    if (!product || !storeId) { setCartMsg("Cannot add to cart."); return; }
    if (missingVariant) {
      toast.error(`Please select a ${missingVariant} before adding to cart.`);
      return;
    }
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId, storeId,
        storeName: product.storeName ?? "",
        name: product.name,
        sku: product.sku ?? "",
        price: product.price,
        mainImage: images[0] ?? null,
        quantity: 1,
        selectedVariants:
          selectedSize == null && !selectedColor
            ? undefined
            : {
                ...(selectedSize == null ? {} : { size: String(selectedSize) }),
                ...(selectedColor ? { color: selectedColor } : {}),
              },
      }),
    });
    if (res.ok) {
      setCartMsg("");
      toast.success("Added to cart!");
    } else {
      setCartMsg("");
      toast.error("Sign in to add to cart.");
    }
  }

  async function handleWishlist() {
    if (!product || !storeId) return;
    await toggleWishlist({
      productId, storeId,
      storeName: product.storeName ?? "",
      name: product.name,
      sku: product.sku ?? "",
      price: product.price,
      mainImage: images[0] ?? null,
    });
    setWishlistMsg("");
  }

  const wishlisted = productId && storeId ? isWishlisted(productId, storeId) : false;

  function handleCustomMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const combined = [...customMediaFiles, ...files].slice(0, 5);
    setCustomMediaFiles(combined);
    setCustomMediaPreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  }

  function removeCustomMedia(idx: number) {
    const next = customMediaFiles.filter((_, i) => i !== idx);
    setCustomMediaFiles(next);
    setCustomMediaPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function handleCustomOrderSubmit() {
    if (!customDesc.trim()) { setCustomOrderMsg("Please add a description."); return; }
    if (customMediaFiles.length === 0) { setCustomOrderMsg("Please attach at least one image."); return; }
    setCustomOrderSubmitting(true);
    setCustomOrderMsg("Uploading images…");
    try {
      // Upload each image to Cloudinary via existing /api/upload
      const uploadedUrls: string[] = [];
      for (const file of customMediaFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Image upload failed.");
        const d = await res.json();
        uploadedUrls.push(d.url);
      }

      setCustomOrderMsg("Submitting order…");
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          storeId,
          productName: product?.name ?? "",
          storeName: product?.storeName ?? "",
          description: customDesc.trim(),
          mediaUrls: uploadedUrls,
        }),
      });
      if (res.ok) {
        toast.success("Custom order submitted!");
        setCustomOrderOpen(false);
        setCustomDesc("");
        setCustomMediaFiles([]);
        setCustomMediaPreviews([]);
        setCustomOrderMsg("");
      } else {
        const d = await res.json();
        setCustomOrderMsg(d.error || "Failed to submit.");
      }
    } catch (err) {
      setCustomOrderMsg(err instanceof Error ? err.message : "Failed to submit.");
    } finally {
      setCustomOrderSubmitting(false);
    }
  }

  async function handleSubmitReview() {
    if (!userRating) { setReviewMsg("Select a rating."); return; }
    if (!storeId) { setReviewMsg("No store context."); return; }
    setSubmittingReview(true);
    setReviewMsg("");
    try {
      const res = await fetch(`/api/stores/${storeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating, text: reviewText }),
      });
      const d = await res.json();
      if (res.ok) {
        setReviewMsg("Review submitted!");
        setUserRating(0);
        setReviewText("");
        // Refresh reviews
        fetch(`/api/stores/${storeId}/reviews`)
          .then((r) => r.json())
          .then((data) => {
            setReviews(data.reviews ?? []);
            setReviewAvg(data.avg ?? 0);
            setReviewTotal(data.total ?? 0);
            setReviewBreakdown(data.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
          });
      } else {
        setReviewMsg(d.error || "Failed to submit review.");
      }
    } finally {
      setSubmittingReview(false);
    }
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] flex items-center justify-center">
        <p className="text-slate-400">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] flex items-center justify-center">
        <p className="text-slate-400">Product not found.</p>
      </div>
    );
  }

  const pct = (n: number) => reviewTotal ? Math.round((n / reviewTotal) * 100) : 0;

  const categoryTags: string[] = (() => {
    const tags: string[] = [];
    if (product?.categories?.length) {
      for (const c of product.categories) {
        const n = c.category?.name;
        if (n && !tags.includes(n)) tags.push(n);
      }
    }
    if (tags.length === 0 && product?.category) tags.push(product.category);
    return tags;
  })();

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-[1480px] px-4 py-4 md:px-6 md:py-10 lg:px-10">

        {/* ═══ MOBILE LAYOUT ═══ */}
        <div className="md:hidden space-y-4">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
              {images.length > 0 ? (
                <img src={images[activeImage] ?? images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.slice(0, 5).map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden ${activeImage === i ? "border-[#68B8C1]" : "border-gray-100"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm dark:bg-slate-900">
            <h1 className="mb-1 text-lg font-bold text-[#68B8C1]">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                ${Number(product.price).toLocaleString()}
              </span>
            </div>
            {product.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 dark:text-slate-400">{product.description}</p>
            )}
            {categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categoryTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/our-products?category=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[#68B8C1]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#68B8C1] hover:bg-[#68B8C1]/20 transition border border-[#68B8C1]/20"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Select Size
                  {selectedSize === null && <span className="ml-1 text-xs font-normal text-red-400">— required</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button key={String(size)} onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full text-xs font-semibold border-2 transition-all ${selectedSize === size ? "border-gray-800 bg-gray-800 text-white" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>
                      {String(size)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Select Color
                  {selectedColor === null && <span className="ml-1 text-xs font-normal text-red-400">— required</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full border-2 px-3 py-2 text-xs font-semibold transition-all ${selectedColor === color ? "border-gray-800 bg-gray-800 text-white" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cartMsg && <p className="text-sm text-emerald-600 mb-2">{cartMsg}</p>}
            {wishlistMsg && <p className="text-sm text-teal-600 mb-2">{wishlistMsg}</p>}

            <button onClick={handleAddToCart} className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#68B8C1] active:scale-95 hover:bg-[#4f9ea7]">
              Add to cart
            </button>
            <button onClick={handleWishlist} className={`mt-2 w-full py-3 rounded-xl font-bold text-sm border-2 transition-all ${wishlisted ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
            {product.isCustomOrderEnabled && (
              <button onClick={() => setCustomOrderOpen(true)} className="mt-2 w-full py-3 rounded-xl font-bold text-sm border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
                ✎ Custom Order
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-4 shadow-sm dark:bg-slate-900">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-slate-400">⊞ Store Rating</p>
            <div className="flex gap-4 items-start mb-4">
              <div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">{reviewAvg.toFixed(1)}</div>
                <StarRating rating={Math.round(reviewAvg)} />
                <div className="text-xs text-gray-400 mt-0.5">{reviewTotal} reviews</div>
              </div>
              <div className="flex-1 space-y-1.5 pt-1">
                {[5, 4, 3].map((s) => <RatingBar key={s} label={String(s)} percent={pct(reviewBreakdown[s] ?? 0)} />)}
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Write a Review</p>
            <StarRating rating={userRating} interactive onRate={setUserRating} />
            <textarea rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience…" className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#68B8C1] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
            {reviewMsg && <p className="text-sm text-teal-600 mt-1">{reviewMsg}</p>}
            <button onClick={handleSubmitReview} disabled={submittingReview} className="mt-2 rounded-xl bg-[#68B8C1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f9ea7] disabled:opacity-60">
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>

          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center dark:bg-slate-900">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm dark:bg-slate-700">
                {r.userName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 truncate dark:text-slate-200">{r.userName}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate dark:text-slate-400">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ DESKTOP LAYOUT ═══ */}
        <div className="hidden md:block space-y-6">
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-10 items-start">
            <div>
              <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden dark:bg-slate-900">
                <div className="aspect-[6/5] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
                  {images.length > 0 ? (
                    <img src={images[activeImage] ?? images[0]} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.slice(0, 4).map((src, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`flex-1 aspect-square bg-white rounded-2xl border-2 overflow-hidden shadow-sm dark:bg-slate-900 ${activeImage === i ? "border-[#68B8C1]" : "border-transparent hover:border-gray-200"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-1">
              <h1 className="mb-3 text-4xl font-extrabold uppercase tracking-tight text-[#68B8C1]">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">
                  ${Number(product.price).toLocaleString()}
                </span>
              </div>
              {product.brand?.name && (
                <p className="text-base font-bold text-gray-800 mb-1 dark:text-slate-200">Brand: {product.brand.name}</p>
              )}
              {product.sku && (
                <p className="text-sm text-gray-500 mb-3 dark:text-slate-400">SKU: {product.sku}</p>
              )}
              {product.description && (
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4 dark:text-slate-400">{product.description}</p>
              )}
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {categoryTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/our-products?category=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-[#68B8C1]/10 px-3 py-1 text-xs font-semibold text-[#68B8C1] hover:bg-[#68B8C1]/20 transition border border-[#68B8C1]/20"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button key={String(size)} onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-full text-sm font-semibold border-2 transition-all ${selectedSize === size ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 text-gray-700 bg-white hover:border-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}>
                        {String(size)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${selectedColor === color ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 text-gray-700 bg-white hover:border-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {cartMsg && <p className="text-sm text-emerald-600 mb-2">{cartMsg}</p>}
              {wishlistMsg && <p className="text-sm text-teal-600 mb-2">{wishlistMsg}</p>}

              <div className="space-y-3">
                <button onClick={handleAddToCart} className="w-full py-3.5 rounded-2xl font-bold text-white transition-all text-base bg-[#68B8C1] hover:bg-[#4f9ea7] active:scale-[0.98]">
                  Add to cart
                </button>
                <button onClick={handleWishlist} className={`w-full py-3.5 rounded-2xl font-bold border-2 transition-all text-base ${wishlisted ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950/30 dark:border-red-500 dark:text-red-400" : "border-gray-300 bg-white text-gray-800 hover:border-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>
                  {wishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
                </button>
                {product.isCustomOrderEnabled && (
                  <button onClick={() => setCustomOrderOpen(true)} className="w-full py-3.5 rounded-2xl font-bold border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all text-base dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                    ✎ Custom Order
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ratings + Reviews */}
          <div className="bg-white rounded-3xl shadow-sm p-8 dark:bg-slate-900">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 dark:text-slate-400">⊞ Store Rating</p>
            <div className="flex gap-12 items-start mb-8">
              <div>
                <div className="text-5xl font-extrabold text-gray-900 mb-1 dark:text-slate-100">{reviewAvg.toFixed(1)}</div>
                <StarRating rating={Math.round(reviewAvg)} />
                <div className="text-sm text-gray-400 mt-1">{reviewTotal} reviews</div>
              </div>
              <div className="flex-1 space-y-2 max-w-sm pt-1">
                {[5, 4, 3].map((s) => <RatingBar key={s} label={String(s)} percent={pct(reviewBreakdown[s] ?? 0)} />)}
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2 dark:text-slate-200">Write a Review</p>
            <StarRating rating={userRating} interactive onRate={setUserRating} />
            <textarea rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience…"
              className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#68B8C1] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400" />
            {reviewMsg && <p className="text-sm text-teal-600 mt-1">{reviewMsg}</p>}
            <button onClick={handleSubmitReview} disabled={submittingReview}
              className="mt-3 rounded-xl bg-[#68B8C1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4aaab4] disabled:opacity-60">
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 dark:bg-slate-900">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-lg dark:bg-slate-700">
                  {r.userName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-slate-200">{r.userName}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{r.text}</p>
                </div>
                <StarRating rating={r.rating} />
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 text-center text-sm text-slate-400 dark:bg-slate-900">
                No reviews yet. Be the first!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* ═══ CUSTOM ORDER MODAL ═══ */}
    {customOrderOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setCustomOrderOpen(false); }}>
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] dark:bg-slate-900">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Custom Order Request</h3>
            <button onClick={() => setCustomOrderOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">×</button>
          </div>
          <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Describe what you need and attach images. Both are required.
            </p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Describe your custom order requirements…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#68B8C1] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Images <span className="text-red-400">*</span>
                <span className="ml-1 font-normal text-slate-400">(up to 5, max 5 MB each)</span>
              </label>
              {customMediaPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {customMediaPreviews.map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => removeCustomMedia(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none shadow"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              {customMediaFiles.length < 5 && (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-[#68B8C1] hover:text-[#68B8C1] transition dark:border-slate-600 dark:text-slate-400">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleCustomMediaSelect}
                  />
                  + Add images
                </label>
              )}
            </div>
            {customOrderMsg && (
              <p className={`text-sm ${customOrderMsg.includes("failed") || customOrderMsg.includes("required") ? "text-red-500" : "text-slate-500"}`}>
                {customOrderMsg}
              </p>
            )}
          </div>
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={() => setCustomOrderOpen(false)} className="flex-1 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button
              onClick={handleCustomOrderSubmit}
              disabled={customOrderSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition"
            >
              {customOrderSubmitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
