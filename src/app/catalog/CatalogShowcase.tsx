"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ----------------------------------------------------------------------------
   Types
---------------------------------------------------------------------------- */

type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
};
type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image: string | null;
  price: number | null;
};
type CatalogData = {
  categories: Category[];
  products: Product[];
};

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */

const SHOWCASE_CATEGORIES = [
  "Activewears",
  "Blazers",
  "Co-ord sets",
  "Fall/Winter Edit",
  "Footwear",
  "Jackets",
  "Jeans",
  "Men",
  "Shirts",
  "Women Vest",
] as const;
const MAX_SHOWCASE_PRODUCTS = 100;

const categoryKey = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function isShowcaseCategory(value: string | null | undefined) {
  const key = categoryKey(value);
  return SHOWCASE_CATEGORIES.some((category) => categoryKey(category) === key);
}

/** Random row layout for phones: each row holds 1, 2 or 3 cards. */
function randomRows(count: number) {
  const out: { size: 1 | 2 | 3; pos: number }[] = [];
  while (out.length < count) {
    const remaining = count - out.length;
    const size = Math.min(1 + Math.floor(Math.random() * 3), remaining) as
      | 1
      | 2
      | 3;
    for (let pos = 0; pos < size; pos++) out.push({ size, pos });
  }
  return out;
}

function imageForCategory(category: Category, products: Product[]) {
  return (
    category.imageUrl ??
    products.find(
      (p) => categoryKey(p.category) === categoryKey(category.name) && p.image,
    )?.image ??
    null
  );
}

/* ----------------------------------------------------------------------------
   Small animation helpers
---------------------------------------------------------------------------- */

/** Fades + lifts its children in once they scroll into view. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`am-reveal ${shown ? "am-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Product card
---------------------------------------------------------------------------- */

function ProductCard({
  product,
  featured,
  size,
}: {
  product: Product;
  featured: boolean;
  size: 1 | 2 | 3;
}) {
  const label = product.brand ?? product.category ?? "Amstani collection";
  const mobileVw = size === 1 ? "100vw" : size === 2 ? "50vw" : "34vw";
  const mobileAspect =
    size === 1 ? "aspect-[4/3] sm:aspect-[4/5]" : "aspect-[4/5]";
  const labelSize =
    size === 3 ? "text-[10px]" : size === 1 ? "text-xs" : "text-[11px]";
  const nameSize =
    size === 3 ? "text-xs" : size === 1 ? "text-lg" : "text-[15px]";

  return (
    <article className="group flex h-full flex-col">
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#e6eeea] shadow-[0_10px_30px_rgba(23,60,61,0.08)] transition-shadow duration-500 group-hover:shadow-[0_22px_44px_rgba(23,60,61,0.18)] ${
          featured
            ? `${mobileAspect} lg:aspect-auto lg:min-h-[320px] lg:flex-1`
            : mobileAspect
        }`}
      >
        <Image
          src={product.image!}
          alt={product.name}
          fill
          sizes={
            featured
              ? `(min-width:1024px) 50vw, ${mobileVw}`
              : `(min-width:1024px) 25vw, (min-width:640px) 33vw, ${mobileVw}`
          }
          className="object-cover transition duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173c3d]/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.category && (
          <span className="absolute left-3 top-3 translate-y-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#173c3d] opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {product.category}
          </span>
        )}

        {/* Featured card: text sits on the image (desktop only) */}
        {featured && (
          <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-[#173c3d]/85 to-transparent p-6 text-white lg:block">
            <p className="text-sm text-[#9bd8d2]">{label}</p>
            <h3 className="mt-1 line-clamp-2 font-serif text-3xl leading-tight">
              {product.name}
            </h3>
          </div>
        )}
      </div>

      <div className={`px-1 pt-3 ${featured ? "lg:hidden" : ""}`}>
        <p
          className={`truncate ${labelSize} font-medium tracking-wide text-[#4c9fa2] sm:text-xs`}
        >
          {label}
        </p>
        <h3
          className={`mt-0.5 line-clamp-2 font-serif ${nameSize} leading-snug text-[#173c3d] sm:text-lg`}
        >
          {product.name}
        </h3>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="am-shimmer aspect-[4/5] rounded-2xl" />
          <div className="am-shimmer mt-3 h-3 w-1/3 rounded-full" />
          <div className="am-shimmer mt-2 h-4 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Page
---------------------------------------------------------------------------- */

export default function CatalogShowcase() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [error, setError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/catalog")
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return response.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const products = useMemo(() => {
    const eligible = (data?.products ?? []).filter(
      (p) => p.image && isShowcaseCategory(p.category),
    );

    for (let index = eligible.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [eligible[index], eligible[randomIndex]] = [
        eligible[randomIndex],
        eligible[index],
      ];
    }

    return eligible.slice(0, MAX_SHOWCASE_PRODUCTS);
  }, [data]);

  const categories = useMemo(
    () =>
      SHOWCASE_CATEGORIES.flatMap((name) => {
        const category = (data?.categories ?? []).find(
          (c) => categoryKey(c.name) === categoryKey(name),
        );
        const showcaseCategory: Category = {
          id: category?.id ?? name,
          name,
          imageUrl: category?.imageUrl ?? null,
          productCount: category?.productCount ?? 0,
        };
        return imageForCategory(showcaseCategory, products)
          ? [showcaseCategory]
          : [];
      }),
    [data, products],
  );

  const filtered = products;

  const mobileLayout = useMemo(() => randomRows(filtered.length), [filtered]);

  const marqueeNames = useMemo(() => {
    const names = categories.map((c) => c.name);
    if (!names.length) return [];
    const repeat = Math.max(1, Math.ceil(8 / names.length));
    return Array.from({ length: repeat }).flatMap(() => names);
  }, [categories]);
  const topCategories = categories.slice(0, 8);
  const bento = topCategories.length >= 8;
  const categoryLayout = useMemo(
    () => randomRows(topCategories.length),
    [topCategories.length],
  );
  const [heroA, heroB, heroC] = products;

  return (
    <main className="am-root min-h-screen overflow-x-hidden bg-[#f7f5f0] text-[#173c3d]">
      <style>{`
        @keyframes am-line-up { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes am-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes am-pop { from { opacity: 0; scale: .6; } to { opacity: 1; scale: 1; } }
        @keyframes am-reveal-arch { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes am-float-a { 0%,100% { translate: 0 0; } 50% { translate: 0 -14px; } }
        @keyframes am-float-b { 0%,100% { translate: 0 0; } 50% { translate: 0 12px; } }
        @keyframes am-marquee { to { transform: translateX(-50%); } }
        @keyframes am-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .am-line > span { display: inline-block; animation: am-line-up 1s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
        .am-fade { animation: am-fade-up .9s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
        .am-pop { animation: am-pop .7s cubic-bezier(.2,.9,.3,1.2) both; animation-delay: var(--d, 0ms); }
        .am-arch { animation: am-reveal-arch 1.3s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
        .am-float-a { animation: am-float-a 7s ease-in-out infinite; }
        .am-float-b { animation: am-float-b 9s ease-in-out infinite; }
        .am-marquee { animation: am-marquee 38s linear infinite; }
        .am-marquee-wrap:hover .am-marquee { animation-play-state: paused; }
        .am-shimmer { background: linear-gradient(90deg, #e6eeea 25%, #f3f7f5 50%, #e6eeea 75%); background-size: 200% 100%; animation: am-shimmer 1.6s linear infinite; }

        .am-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
        .am-reveal.am-in { opacity: 1; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          .am-root *, .am-root *::before, .am-root *::after { animation: none !important; transition: none !important; }
          .am-reveal { opacity: 1; transform: none; }
        }
      `}</style>

      {/* ------------------------------------------------------------ Header */}
      <header
        className={`fixed inset-x-0 top-0 z-30 px-5 text-white transition-all duration-500 sm:px-8 lg:px-12 ${
          scrolled
            ? "bg-[#173c3d]/85 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
            : "py-5"
        }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center">
          <Link
            href="/become-a-store-owner"
            className="inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9bd8d2]"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.3em]">
            Amstani &amp; Co
          </span>
          <div />
        </div>
      </header>

      {/* -------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-[#173c3d] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(139,211,207,0.28),transparent_38%),radial-gradient(circle_at_8%_90%,rgba(76,159,162,0.25),transparent_40%)]" />

        <div className="relative mx-auto grid min-h-[620px] lg:min-h-[780px] max-w-7xl items-center gap-10 px-5 pb-14 pt-28 sm:pt-32 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-12">
          <div className="relative z-10">
            <p
              className="am-fade text-xs font-semibold uppercase tracking-[0.3em] text-[#9bd8d2]"
              style={{ "--d": "100ms" } as CSSProperties}
            >
              The Amstani edit
            </p>
            <h1 className="mt-5 font-serif text-[2.6rem] leading-[1] tracking-[-0.035em] sm:text-7xl">
              {["A world of", "texture, color,", "and character."].map(
                (line, i) => (
                  <span
                    key={line}
                    className="am-line block overflow-hidden pb-[0.1em]"
                  >
                    <span
                      style={{ "--d": `${250 + i * 140}ms` } as CSSProperties}
                    >
                      {line}
                    </span>
                  </span>
                ),
              )}
            </h1>
            <p
              className="am-fade mt-7 max-w-md text-base leading-8 text-[#d0e3e1]"
              style={{ "--d": "800ms" } as CSSProperties}
            >
              Explore a refined collection of American-style fashion and
              beautifully made pieces selected for modern wardrobes.
            </p>
            <div
              className="am-fade mt-9 flex items-center gap-3 text-sm text-[#b8d7d4]"
              style={{ "--d": "950ms" } as CSSProperties}
            >
              <span className="h-px w-12 bg-[#9bd8d2]" />
            </div>
          </div>

          {/* Collage */}
          <div className="relative mx-auto h-[370px] w-full max-w-xl sm:h-[580px]">
            <div className="am-float-a absolute left-[6%] top-0 h-[78%] w-[52%]">
              <div
                className="am-arch relative h-full w-full -rotate-[4deg] overflow-hidden rounded-t-[12rem] rounded-b-[2rem] border border-white/40 bg-[#23585b]"
                style={{ "--d": "300ms" } as CSSProperties}
              >
                {heroA?.image && (
                  <Image
                    src={heroA.image}
                    alt={heroA.name}
                    fill
                    sizes="(min-width:1024px) 28vw, 52vw"
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            <div className="am-float-b absolute bottom-0 right-0 h-[62%] w-[44%]">
              <div
                className="am-pop relative h-full w-full rotate-[6deg] overflow-hidden rounded-[2rem] border-8 border-[#173c3d] bg-[#23585b]"
                style={{ "--d": "700ms" } as CSSProperties}
              >
                {heroB?.image && (
                  <Image
                    src={heroB.image}
                    alt={heroB.name}
                    fill
                    sizes="(min-width:1024px) 24vw, 44vw"
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            <div className="am-float-a absolute bottom-[6%] left-0 h-24 w-24 sm:h-36 sm:w-36">
              <div
                className="am-pop relative h-full w-full overflow-hidden rounded-full border-[6px] border-[#9bd8d2] bg-[#23585b]"
                style={{ "--d": "1000ms" } as CSSProperties}
              >
                {heroC?.image && (
                  <Image
                    src={heroC.image}
                    alt={heroC.name}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Marquee */}
      {marqueeNames.length > 0 && (
        <div
          className="am-marquee-wrap overflow-hidden bg-[#9bd8d2] py-4 text-[#173c3d]"
          aria-hidden="true"
        >
          <div className="am-marquee flex w-max">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 items-center">
                {marqueeNames.map((name, i) => (
                  <span
                    key={`${group}-${i}`}
                    className="flex items-center font-serif text-xl sm:text-3xl"
                  >
                    <span className="px-6">{name}</span>
                    <span className="h-2 w-2 rotate-45 bg-[#173c3d]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h2 className="font-serif text-3xl">
            The collection is taking a moment.
          </h2>
          <p className="mt-3 text-[#6d8585]">
            Refresh to see the latest pieces.
          </p>
        </div>
      ) : !data ? (
        <section className="px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-center text-[#6d8585]">
              Loading the latest collection...
            </p>
            <SkeletonGrid />
          </div>
        </section>
      ) : (
        <>
          {/* -------------------------------------------------- Categories */}
          {
            <section className="bg-[#e6eeea] px-5 py-14 sm:px-8 sm:py-28 lg:px-12">
              <div className="mx-auto max-w-7xl">
                <Reveal>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4c9fa2]">
                        Browse the mood
                      </p>
                      <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-6xl">
                        Find your kind of beautiful.
                      </h2>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-[#5f7979]">
                      Important categories, photographed from the live
                      collection.
                    </p>
                  </div>
                </Reveal>

                <div
                  className={`mt-10 grid grid-cols-6 auto-rows-[170px] gap-3 sm:gap-4 ${
                    bento
                      ? "[grid-auto-flow:dense] sm:grid-cols-2 sm:auto-rows-[220px] lg:auto-rows-[240px] lg:grid-cols-4"
                      : "sm:grid-cols-2 sm:auto-rows-auto lg:grid-cols-3"
                  }`}
                >
                  {topCategories.map((category, index) => {
                    const { size, pos } = categoryLayout[index];
                    const mobileSpan = {
                      1: "col-span-6",
                      2: "col-span-3",
                      3: "col-span-2",
                    }[size];
                    const desktopSpan = bento
                      ? index === 0
                        ? "sm:col-span-2 sm:row-span-2"
                        : index === 3
                          ? "sm:col-span-2"
                          : "sm:col-span-1"
                      : "sm:col-span-1 sm:aspect-[4/3]";
                    const big = bento && index === 0;
                    const mobileVw =
                      size === 1 ? "100vw" : size === 2 ? "50vw" : "34vw";
                    const mobileTitle =
                      size === 3
                        ? "text-sm"
                        : size === 1
                          ? "text-2xl"
                          : "text-lg";
                    return (
                      <Reveal
                        key={category.id}
                        delay={pos * 80}
                        className={`${mobileSpan} ${desktopSpan}`}
                      >
                        <div className="group relative block h-full w-full overflow-hidden rounded-2xl bg-[#173c3d]">
                          <Image
                            src={imageForCategory(category, products)!}
                            alt=""
                            fill
                            sizes={`(min-width:1024px) ${big ? "50vw" : "25vw"}, (min-width:640px) 50vw, ${mobileVw}`}
                            className="object-cover transition duration-[900ms] ease-out group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#173c3d]/80 via-[#173c3d]/10 to-transparent transition-opacity duration-500 group-hover:from-[#173c3d]/90" />
                          <div
                            className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 text-white sm:p-5 ${
                              size === 3 ? "p-3" : "p-4"
                            }`}
                          >
                            <h3
                              className={`font-serif leading-tight ${mobileTitle} ${
                                big ? "sm:text-5xl" : "sm:text-2xl"
                              }`}
                            >
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                  {!categories.length && (
                    <p className="col-span-full text-[#5f7979]">
                      Categories will appear here as the collection grows.
                    </p>
                  )}
                </div>
              </div>
            </section>
          }

          {/* ------------------------------------------------- Collection */}
          <section
            id="collection"
            className="scroll-mt-16 px-5 py-14 sm:px-8 sm:py-28 lg:px-12"
          >
            <div className="mx-auto max-w-7xl">
              <Reveal>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4c9fa2]">
                      From the collection
                    </p>
                    <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-6xl">
                      Pieces with a story to tell.
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6d8585]">
                    <Sparkles size={16} className="text-[#4c9fa2]" /> Live
                    collection
                  </div>
                </div>
              </Reveal>
              {/* Grid */}
              {filtered.length > 0 ? (
                <div className="mt-10 grid grid-cols-6 gap-x-3 gap-y-6 [grid-auto-flow:dense] sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
                  {filtered.map((product, index) => {
                    const featured = index % 9 === 0;
                    const { size, pos } = mobileLayout[index];
                    const span = {
                      1: "col-span-6 sm:col-span-1",
                      2: "col-span-3 sm:col-span-1",
                      3: "col-span-2 sm:col-span-1",
                    }[size];
                    return (
                      <Reveal
                        key={product.id}
                        delay={pos * 70}
                        className={`h-full ${span} ${featured ? "lg:col-span-2 lg:row-span-2" : ""}`}
                      >
                        <ProductCard
                          product={product}
                          featured={featured}
                          size={size}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-14 text-[#6d8585]">
                  Products will appear here as the collection grows.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Closing */}
      <section className="relative overflow-hidden bg-[#173c3d] px-5 py-16 text-center text-white sm:px-8 sm:py-32">
        <div className="am-float-a pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#23585b]" />
        <div className="am-float-b pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#9bd8d2]/20" />

        <Reveal className="relative">
          {products.length > 4 && (
            <div className="mb-8 flex justify-center -space-x-3">
              {products.slice(3, 8).map((p) => (
                <span
                  key={p.id}
                  className="relative h-14 w-14 overflow-hidden rounded-full border-4 border-[#173c3d] bg-[#23585b] sm:h-16 sm:w-16"
                >
                  <Image
                    src={p.image!}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9bd8d2]">
            The Amstani collection
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-6xl">
            A closer look at what is available.
          </h2>
        </Reveal>
      </section>
    </main>
  );
}
