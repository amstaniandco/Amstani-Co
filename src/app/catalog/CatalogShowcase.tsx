"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Brand = { id: string; name: string; productCount: number };
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
  brands: Brand[];
  categories: Category[];
  products: Product[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=1100&fit=crop";

function imageForCategory(category: Category, products: Product[]) {
  return (
    category.imageUrl ??
    products.find((product) => product.category === category.name)?.image ??
    FALLBACK_IMAGE
  );
}

function isFootwear(product: Product) {
  const searchableText = [product.name, product.category, product.brand]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(shoe|shoes|sneaker|sneakers|boot|boots|sandal|sandals|slipper|slippers|loafer|loafers|heels?|footwear)\b/.test(
    searchableText,
  );
}

export default function CatalogShowcase() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return response.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const products = useMemo(
    () =>
      data?.products
        .filter((product) => product.image && !isFootwear(product))
        .slice(0, 20) ?? [],
    [data],
  );
  const brands = data?.brands ?? [];
  const categories = useMemo(
    () =>
      data?.categories.filter(
        (category) =>
          !/\b(shoe|shoes|sneaker|sneakers|boot|boots|sandal|sandals|slipper|slippers|loafer|loafers|heels?|footwear)\b/i.test(
            category.name,
          ),
      ) ?? [],
    [data],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#173c3d]">
      <header className="absolute inset-x-0 top-0 z-20 px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/20 pb-5">
          <Link
            href="/become-a-store-owner"
            className="inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.3em]">
            Amstani &amp; Co
          </span>
        </div>
      </header>

      <section className="relative min-h-[720px] overflow-hidden bg-[#173c3d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(139,211,207,0.28),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-end gap-12 px-5 pb-16 pt-36 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:pb-24">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9bd8d2]">
              The Amstani edit
            </p>
            <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              A world of texture, color, and character.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#d0e3e1]">
              Explore the latest collection of fashion, fabrics, and
              beautifully made pieces from the brands in our marketplace.
            </p>
            <div className="mt-9 flex items-center gap-3 text-sm text-[#b8d7d4]">
              <span className="h-px w-12 bg-[#9bd8d2]" />
              {data ? `${products.length} featured pieces to explore` : "A living collection, always evolving"}
            </div>
          </div>
          <div className="relative h-[430px] sm:h-[540px]">
            <div className="absolute right-[18%] top-0 h-[78%] w-[48%] rotate-[-5deg] overflow-hidden rounded-t-[12rem] rounded-b-[2rem] border border-white/40">
              {products[0]?.image && (
                <Image
                  src={products[0].image}
                  alt={products[0].name}
                  fill
                  sizes="45vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-[64%] w-[42%] rotate-[7deg] overflow-hidden rounded-[2rem] border-8 border-[#173c3d]">
              {products[1]?.image && (
                <Image
                  src={products[1].image}
                  alt={products[1].name}
                  fill
                  sizes="40vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="absolute bottom-[9%] left-[5%] h-24 w-24 rounded-full bg-[#9bd8d2] sm:h-32 sm:w-32" />
          </div>
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h2 className="font-serif text-3xl">The collection is taking a moment.</h2>
          <p className="mt-3 text-[#6d8585]">Refresh to see the latest pieces.</p>
        </div>
      ) : !data ? (
        <div className="px-5 py-28 text-center text-[#6d8585]">
          Loading the latest collection...
        </div>
      ) : (
        <>
          <section className="bg-white px-5 py-24 text-[#173c3d] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col justify-between gap-5 border-b border-[#d9e5e1] pb-8 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4c7776]">
                    The names behind it
                  </p>
                  <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                    Meet the brands in our world.
                  </h2>
                </div>
                <p className="text-sm text-[#6d8585]">
                  {brands.length} brands in the collection
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-x-8 md:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand, index) => (
                  <div
                    key={brand.id}
                    className="group flex min-w-0 items-center gap-3 border-b border-[#e1ebe7] py-4 transition hover:border-[#4c9fa2]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d5ebe7] text-[10px] font-semibold uppercase text-[#4c9fa2] ring-1 ring-[#b8d7d4] transition group-hover:bg-[#173c3d] group-hover:text-white">
                        {brand.name.charAt(0)}
                      </span>
                      <span
                        className={`truncate font-serif text-lg transition-colors group-hover:text-[#267f8c] sm:text-xl ${
                          index % 4 === 1
                            ? "text-[#267f8c]"
                            : index % 4 === 2
                                ? "text-[#4f8f82]"
                              : index % 4 === 3
                                  ? "text-[#729b78]"
                                : "text-[#173c3d]"
                        }`}
                      >
                        {brand.name}
                      </span>
                    </div>
                  </div>
                ))}
                {!brands.length && (
                  <p className="py-5 text-[#6d8585]">
                    Brands will appear here as the collection grows.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="bg-[#e6eeea] px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4c9fa2]">
                    Browse the mood
                  </p>
                  <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                    Find your kind of beautiful.
                  </h2>
                </div>
                <p className="max-w-xs text-sm leading-6 text-[#657d79]">
                  Important categories, photographed from the live collection.
                </p>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className={`group relative overflow-hidden ${
                      index % 2 === 1 ? "mt-8" : ""
                    }`}
                  >
                    <Image
                      src={imageForCategory(category, products)}
                      alt={category.name}
                      width={600}
                      height={780}
                      className="aspect-[3/4] w-full object-cover grayscale-[15%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#173c3d]/75 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <h3 className="font-serif text-2xl">{category.name}</h3>
                    </div>
                  </div>
                ))}
                {!categories.length && (
                  <p className="text-[#5f7979]">Categories will appear here as the collection grows.</p>
                )}
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4c9fa2]">
                    From the collection
                  </p>
                  <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                    Pieces with a story to tell.
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6d8585]">
                  <Sparkles size={16} className="text-[#4c9fa2]" /> Live collection
                </div>
              </div>
              <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`group ${index === 1 ? "lg:mt-12" : ""}`}
                  >
                    <div className="relative overflow-hidden bg-[#e6eeea]">
                      <Image
                        src={product.image!}
                        alt={product.name}
                        width={700}
                        height={850}
                        className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3 pt-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#4c9fa2]">
                          {product.brand ?? product.category ?? "Amstani collection"}
                        </p>
                        <h3 className="mt-2 font-serif text-2xl">{product.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
                {!products.length && (
                  <p className="text-[#6d8585]">Products will appear here as the collection grows.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="bg-[#173c3d] px-5 py-24 text-center text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9bd8d2]">
          The Amstani collection
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
          A closer look at what is available.
        </h2>
      </section>
    </main>
  );
}
