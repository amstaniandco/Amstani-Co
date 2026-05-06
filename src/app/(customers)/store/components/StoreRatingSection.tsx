"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Review = {
  _id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

function StarRow({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (s: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} ${star <= (hovered || rating) ? "text-yellow-400" : "text-gray-300 dark:text-slate-600"}`}
        >★</button>
      ))}
    </div>
  );
}

export default function StoreRatingSection() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setAvg(d.avg ?? 0);
        setTotal(d.total ?? 0);
        setBreakdown(d.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [storeId]);

  async function handleSubmit() {
    if (!userRating) { setMsg("Select a star rating."); return; }
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch(`/api/stores/${storeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating, text: reviewText }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("Review submitted!");
        setUserRating(0);
        setReviewText("");
        load();
      } else {
        setMsg(d.error || "Failed to submit.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 dark:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-blue-500 dark:text-sky-300">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.26h6.584c.969 0 1.371 1.24.588 1.81l-5.33 3.872 2.036 6.26c.3.921-.755 1.688-1.538 1.118L12 18.347l-5.327 3.9c-.783.57-1.838-.197-1.538-1.118l2.036-6.26-5.33-3.872c-.783-.57-.38-1.81.588-1.81h6.584l2.036-6.26z" />
          </svg>
        </div>
        <div className="font-semibold text-gray-700 dark:text-slate-100">Store Rating</div>
      </div>

      <div className="flex items-start gap-6">
        <div className="flex flex-col items-start">
          <div className="text-5xl font-bold text-gray-800 dark:text-slate-100">{avg.toFixed(1)}</div>
          <StarRow rating={Math.round(avg)} />
          <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">{total} reviews</div>
        </div>
        <div className="flex-1 space-y-3">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-4 text-sm dark:text-slate-300">{s}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                <div className="h-full bg-yellow-400 transition-all" style={{ width: `${pct(breakdown[s] ?? 0)}%` }} />
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{pct(breakdown[s] ?? 0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 dark:border-slate-700">
          {reviews.slice(0, 5).map((r) => (
            <div key={r._id} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm dark:bg-slate-700">{r.userName[0]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{r.userName}</span>
                  <StarRow rating={r.rating} />
                </div>
                {r.text && <p className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">{r.text}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <div className="mb-2 font-medium text-gray-700 dark:text-slate-100">Write a Review</div>
        <StarRow rating={userRating} interactive onRate={setUserRating} />
        <textarea rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience…"
          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#5fb9c3] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400" />
        {msg && <p className="text-sm text-teal-600 mt-1">{msg}</p>}
        <button onClick={handleSubmit} disabled={submitting}
          className="mt-3 rounded-xl bg-[#5fb9c3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4aaab4] disabled:opacity-60">
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
