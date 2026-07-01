"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Volume2, VolumeX } from "lucide-react";

type Slide = {
  imageUrl: string;
  label: string;
  mediaType: "image" | "video";
  storeId?: string;
  endDate?: string;
  isPromotion: boolean;
};

const INTERVAL = 4500;

export default function PromotionBannerSlideshow() {
  const [promotions, setPromotions] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/promotions/active").then((r) => r.ok ? r.json() : { promotions: [] }).catch(() => ({ promotions: [] })),
      fetch("/api/communications/banners").then((r) => r.ok ? r.json() : { banners: [] }).catch(() => ({ banners: [] })),
    ]).then(([promoData, commData]) => {
      const promoSlides: Slide[] = (promoData.promotions || []).map((p: any) => ({
        imageUrl: p.imageUrl,
        label: p.storeName,
        mediaType: p.mediaType === "video" ? "video" : "image",
        storeId: p.storeId,
        endDate: p.endDate,
        isPromotion: true,
      }));
      const commSlides: Slide[] = (commData.banners || [])
        .filter((b: any) => b.imageUrl)
        .map((b: any) => ({
          imageUrl: b.imageUrl,
          label: b.title || "",
          mediaType: b.mediaType === "video" ? "video" : "image",
          isPromotion: false,
        }));
      setPromotions([...promoSlides, ...commSlides]);
    });
  }, []);

  // Auto-advance sidebar thumbnail (pause when modal is open)
  useEffect(() => {
    if (promotions.length <= 1 || modalOpen) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % promotions.length);
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [promotions.length, modalOpen]);

  if (!promotions.length) return null;

  const openModal = (idx: number) => {
    setModalIdx(idx);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const prev = () => setModalIdx((c) => (c - 1 + promotions.length) % promotions.length);
  const next = () => setModalIdx((c) => (c + 1) % promotions.length);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setTouchStartX(null);
  };

  const slide = promotions[current];
  const modalSlide = promotions[modalIdx];

  return (
    <>
      {/* ── Compact sidebar widget ─────────────────────────────── */}
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl shadow-sm"
        onClick={() => openModal(current)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openModal(current)}
        aria-label="View featured promotion"
      >
        {slide.mediaType === "video" ? (
          <video
            key={slide.imageUrl}
            src={slide.imageUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="h-[350px] w-full object-cover transition-opacity duration-500"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt={slide.label}
            className="h-[350px] w-full object-cover transition-opacity duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Mute / unmute toggle (video only) */}
        {slide.mediaType === "video" && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}

        {/* Label */}
        <div className="absolute bottom-3 left-3 right-3">
          {slide.isPromotion && (
            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[9px] font-bold text-white">
              ✦ Best Featured
            </span>
          )}
          {slide.label && (
            <p className="mt-1 truncate text-xs font-semibold text-white drop-shadow">
              {slide.label}
            </p>
          )}
        </div>

        {/* Expand hint */}
        <div className="absolute right-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[9px] text-white backdrop-blur-sm">
          tap to view
        </div>

        {/* Dots */}
        {promotions.length > 1 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1">
            {promotions.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Full-screen popup modal ─────────────────────────────── */}
      {mounted && modalOpen && createPortal(
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Slides */}
            <div className="relative h-[60vw] max-h-[400px] min-h-[220px]">
              {promotions.map((p, i) => (
                <div
                  key={p.imageUrl + i}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === modalIdx ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  {p.mediaType === "video" ? (
                    <video
                      src={p.imageUrl}
                      autoPlay={i === modalIdx}
                      loop
                      muted={muted}
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.label}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
              ))}

              {/* Mute / unmute toggle (video only) */}
              {modalSlide.mediaType === "video" && (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                  aria-label={muted ? "Unmute video" : "Mute video"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}

              {/* Desktop arrow buttons */}
              {promotions.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 sm:flex"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 sm:flex"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between gap-3 bg-[#111] px-5 py-4">
              <div className="min-w-0">
                {modalSlide.isPromotion && (
                  <span className="rounded-full bg-violet-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    ✦ Best Featured
                  </span>
                )}
                {modalSlide.label && (
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {modalSlide.label}
                  </p>
                )}
                {modalSlide.endDate && (
                  <p className="text-[10px] text-slate-400">
                    Featured until {modalSlide.endDate}
                  </p>
                )}
              </div>
              {modalSlide.storeId && (
                <Link
                  href={`/store?storeId=${modalSlide.storeId}`}
                  onClick={closeModal}
                  className="shrink-0 rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-600"
                >
                  Visit Store →
                </Link>
              )}
            </div>

            {/* Dots */}
            {promotions.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 bg-[#111] pb-3">
                {promotions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setModalIdx(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === modalIdx ? "w-5 bg-violet-400" : "w-1.5 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
