"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Star, Store } from "lucide-react";

type MallCard = {
  id: number;
  image: string;
  badge: string;
  title: string;
  description: string;
  state: string;
  rating: string;
};

const digitalMallCards: MallCard[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    badge: "Ranked #1",
    title: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    rating: "4.9",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    badge: "Ranked #1",
    title: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    rating: "4.9",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
    badge: "Ranked #1",
    title: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    rating: "4.9",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    badge: "Ranked #2",
    title: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    rating: "4.8",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    badge: "Ranked #3",
    title: "Name of the store",
    description: "Description of the store can be written here",
    state: "Name of State",
    rating: "4.8",
  },
];

function getCardsPerView(width: number) {
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
}

export default function DigitalMallSection() {
  const [cardsPerView, setCardsPerView] = useState<number>(2);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = useMemo(
    () => Math.max(digitalMallCards.length - cardsPerView, 0),
    [cardsPerView]
  );

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <section className="bg-[#f5f6f8] pb-8 pt-4 sm:pb-10">
      <div className="w-full px-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              <Store className="h-6 w-6" />
              The Digital Mall
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Curated luxury boutiques from across the nation.
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous"
              disabled={!canGoPrev}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-500 bg-slate-200 text-slate-800 transition hover:border-slate-700 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={!canGoNext}
              onClick={() =>
                setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-500 bg-slate-200 text-slate-800 transition hover:border-slate-700 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="-mx-2 flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / cardsPerView}%)`,
            }}
          >
            {digitalMallCards.map((card, index) => (
              <div
                key={card.id}
                className="w-1/2 flex-none px-2 md:w-1/3 lg:w-1/4 xl:w-1/5"
              >
                <article
                  className="group relative h-[260px] overflow-hidden rounded-2xl sm:h-[295px]"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/25 to-black/80" />

                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {index === 1 ? "Live" : card.badge}
                  </div>

                  <div className="absolute right-3 top-3 rounded-full bg-[#7acbd6] px-2 py-0.5 text-[10px] font-semibold text-white">
                    {card.badge}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold sm:text-base">
                        {card.title}
                      </h3>
                      <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                        <Star className="h-3 w-3 fill-white text-white" />
                        {card.rating}
                      </div>
                    </div>

                    <p className="text-[11px] text-white/90 sm:text-xs">
                      {card.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-white/90">
                        <MapPin className="h-3 w-3" />
                        {card.state}
                      </span>

                      <button
                        type="button"
                        aria-label="Open Store"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#7acbd6] text-white transition hover:bg-[#69bdc9]"
                      >
                        <Store className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
