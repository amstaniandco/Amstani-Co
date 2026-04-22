"use client";
import { useState } from "react";

const product = {
  name: "Air Jordan True Flight",
  price: 51,
  originalPrice: 60,
  discount: 15,
  material: "Premium Leather & Mesh",
  description:
    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquot nec, vulputate.",
  sizes: [38, 40, 42, 44, 46],
  colors: [
    { name: "Mint", value: "#a8d8d8" },
    { name: "Black", value: "#1a1a1a" },
    { name: "Sand", value: "#d4a896" },
    { name: "Gold", value: "#c8a840" },
  ],
  rating: 5.0,
  reviewCount: 128,
  ratingBreakdown: { 5: 96, 4: 6, 3: 0 },
};

const reviews = [
  {
    id: 1,
    name: "Marcus Johnson",
    rating: 5,
    text: "Supporting line text lorem ipsum dolor sit amet, consectetur.",
  },
  {
    id: 2,
    name: "Sarah Chen",
    rating: 5,
    text: "Supporting line text lorem ipsum dolor sit amet, consectetur.",
  },
  {
    id: 3,
    name: "Alejandro Rivera",
    rating: 4,
    text: "Supporting line text lorem ipsum dolor sit amet, consectetur.",
  },
];

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (star: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-all ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= (hovered || rating) ? "text-amber-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 font-medium dark:text-slate-400">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
        <div
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-400 text-xs dark:text-slate-500">{percent}%</span>
    </div>
  );
}

// Inline SVG shoe illustration (no external images needed)
function ShoeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 180"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="150" cy="162" rx="120" ry="14" fill="#d1d5db" />
      <path
        d="M30 152 Q45 128 90 112 Q120 102 165 105 Q210 108 240 90 Q262 75 272 68 L258 64 Q232 82 198 90 Q150 98 105 98 Q68 98 46 117 Q28 132 27 148 Z"
        fill="#6b7280"
      />
      <path
        d="M90 112 Q120 102 165 105 Q210 108 247 88 Q266 73 274 65 L268 57 Q243 75 202 84 Q157 92 112 93 Q75 94 52 110 Q37 120 33 138 L46 135 Q52 120 90 112 Z"
        fill="#9ca3af"
      />
      <path
        d="M120 98 Q165 90 210 84 Q237 78 255 66 L249 60 Q228 75 192 81 Q150 87 112 90 Z"
        fill="#d1d5db"
        opacity="0.6"
      />
      <path
        d="M33 148 Q45 132 83 123 Q112 116 150 116 L150 126 Q112 126 83 134 Q48 141 37 153 Z"
        fill="#e5e7eb"
      />
      <path
        d="M112 100 Q143 97 180 101 Q160 105 128 112 Z"
        fill="white"
        opacity="0.5"
      />
      <path
        d="M105 103 Q112 96 120 103"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M123 101 Q130 94 138 101"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M141 99 Q148 92 156 99"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M159 97 Q166 90 174 97"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState(42);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [activeImage, setActiveImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const ThumbBox = ({ index }: { index: number }) => (
    <button
      onClick={() => setActiveImage(index)}
      className={`flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden dark:from-slate-800 dark:to-slate-900 ${
        activeImage === index ? "border-[#68B8C1]" : "border-gray-100 dark:border-slate-700"
      }`}
    >
      <ShoeIllustration className="w-full p-1" />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-[1480px] px-4 py-4 md:px-6 md:py-10 lg:px-10">
        {/* ═══ MOBILE LAYOUT ═══ */}
        <div className="md:hidden space-y-4">
          {/* Main image */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900">
            <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ● On Sale
            </span>
            <span className="absolute top-3 right-3 z-10 bg-red-500 border border-gray-200 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {product.discount}% Off
            </span>
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
              <ShoeIllustration className="w-full max-w-xs drop-shadow-xl" />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <ThumbBox key={i} index={i} />
            ))}
          </div>
          <style>{`.flex.gap-2.overflow-x-auto button { width: 56px; height: 56px; }`}</style>

          {/* Info card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm dark:bg-slate-900">
            <h1 className="mb-1 text-lg font-bold text-[#68B8C1]">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400 line-through text-sm">
                ${product.originalPrice}
              </span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                ${product.price}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1 dark:text-slate-200">
              Material: {product.material}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 dark:text-slate-400">
              {product.description}
            </p>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-full text-xs font-semibold border-2 transition-all ${
                      selectedSize === size
                        ? "border-gray-800 bg-gray-800 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Select Color
              </p>
              <div className="flex gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-gray-800 scale-110"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${
                addedToCart ? "bg-green-500" : "bg-[#68B8C1] active:scale-95"
              }`}
            >
              {addedToCart ? "✓ Added!" : "Add to cart"}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <svg
                className="h-3.5 w-3.5 text-[#68B8C1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-xs text-gray-500 font-medium dark:text-slate-400">
                Secure Checkout
              </span>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
              commodo ligula eget dolor. Aenean
            </p>
          </div>

          {/* Mobile Ratings */}
          <div className="bg-white rounded-2xl p-4 shadow-sm dark:bg-slate-900">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-slate-400">
              ⊞ Store Rating
            </p>
            <div className="flex gap-4 items-start mb-4">
              <div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">
                  {product.rating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(product.rating)} />
                <div className="text-xs text-gray-400 mt-0.5">
                  {product.reviewCount} reviews
                </div>
              </div>
              <div className="flex-1 space-y-1.5 pt-1">
                <RatingBar label="5" percent={product.ratingBreakdown[5]} />
                <RatingBar label="4" percent={product.ratingBreakdown[4]} />
                <RatingBar label="3" percent={product.ratingBreakdown[3]} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">
              Write a Review
            </p>
            <StarRating
              rating={userRating}
              interactive
              onRate={setUserRating}
            />
          </div>

          {/* Mobile Reviews */}
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center dark:bg-slate-900"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm dark:bg-slate-700 dark:text-slate-300">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 truncate dark:text-slate-200">
                    {r.name.split(" ")[0] + "…"}
                  </span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate dark:text-slate-400">
                  {r.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ DESKTOP LAYOUT ═══ */}
        <div className="hidden md:block space-y-6">
          {/* Top: Left gallery col + Right details col — no shared card */}
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-10 items-start">
            {/* LEFT: Main image card + thumbnails below */}
            <div>
              {/* Main image — its own white card */}
              <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden dark:bg-slate-900">
                <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ● On Sale
                </span>
                <span className="absolute top-4 right-4 z-10 bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                  {product.discount}% Off
                </span>
                <div className="aspect-[6/5] flex items-center justify-center p-12 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
                  <ShoeIllustration className="w-[92%] max-w-none drop-shadow-[0_28px_55px_rgba(2,6,23,0.18)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
                </div>
              </div>

              {/* Thumbnails — each is its own separate small white card */}
              <div className="flex gap-3 mt-4">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-1 aspect-square bg-white rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden shadow-sm dark:bg-slate-900 ${
                      activeImage === i
                        ? "border-[#68B8C1]"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <ShoeIllustration className="w-4/5 p-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Product details — no card, raw on background */}
            <div className="pt-1">
              <h1 className="mb-3 text-4xl font-extrabold uppercase tracking-tight text-[#68B8C1]">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">
                  ${product.price}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              </div>
              <p className="text-base font-bold text-gray-800 mb-3 dark:text-slate-200">
                Material: {product.material}
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-5 dark:text-slate-400">
                {product.description}
              </p>

              {/* Size + Color side by side */}
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Select Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.slice(0, 4).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-full text-sm font-semibold border-2 transition-all ${
                          selectedSize === size
                            ? "border-gray-800 bg-gray-800 text-white"
                            : "border-gray-300 text-gray-700 bg-white hover:border-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Select Color
                  </p>
                  <div className="flex gap-2.5 mt-1">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? "border-gray-800 scale-110 shadow-md"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all text-base ${
                    addedToCart
                      ? "bg-green-500"
                      : "bg-[#68B8C1] hover:bg-[#4f9ea7] active:scale-[0.98]"
                  }`}
                >
                  {addedToCart ? "✓ Added to Cart!" : "Add to cart"}
                </button>
                <button className="w-full py-3.5 rounded-2xl font-bold text-gray-800 border-2 border-gray-300 bg-white hover:border-gray-500 transition-all text-base dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-400">
                  Custom Order
                </button>
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-[#68B8C1]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium dark:text-slate-400">
                      Secure Checkout
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                    Aenean commodo ligula eget dolor. Aenean
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings + Reviews — white card */}
          <div className="bg-white rounded-3xl shadow-sm p-8 dark:bg-slate-900">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 dark:text-slate-400">
              ⊞ Store Rating
            </p>
            <div className="flex gap-12 items-start mb-8">
              <div>
                <div className="text-5xl font-extrabold text-gray-900 mb-1 dark:text-slate-100">
                  {product.rating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(product.rating)} />
                <div className="text-sm text-gray-400 mt-1">
                  {product.reviewCount} reviews
                </div>
              </div>
              <div className="flex-1 space-y-2 max-w-sm pt-1">
                <RatingBar label="5" percent={product.ratingBreakdown[5]} />
                <RatingBar label="4" percent={product.ratingBreakdown[4]} />
                <RatingBar label="3" percent={product.ratingBreakdown[3]} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Write a Review
            </p>
            <StarRating
              rating={userRating}
              interactive
              onRate={setUserRating}
            />
          </div>

          {/* Desktop Reviews */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 dark:bg-slate-900"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-lg dark:bg-slate-700 dark:text-slate-300">
                  {r.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-slate-200">{r.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{r.text}</p>
                </div>
                <StarRating rating={r.rating} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
