"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Star, Store } from "lucide-react";
import {
  getSelectedState,
  subscribeSelectedState,
} from "../../lib/state-preference";

type StoreCard = {
  id: string;
  image: string;
  title: string;
  description: string;
  state: string;
  rating: string;
  live: boolean;
  liveLink?: string | null;
};

export default function DigitalMallSection() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStores = async (state: string) => {
      try {
        setLoading(true);
        const url = new URL("/api/stores/browse", window.location.origin);
        url.searchParams.set("promoted_only", "true");
        if (state) url.searchParams.set("state", state);
        const response = await fetch(url.toString());
        if (!response.ok) return;

        const data = await response.json();
        if (!mounted) return;

        const mapped: StoreCard[] = (data.stores ?? []).map(
          (store: Record<string, any>) => {
            const imageSource = (store.bannerUrl || store.logoUrl || "").trim();
            const image = imageSource.startsWith("https://")
              ? imageSource
              : "/assets/placeholder-store.svg";

            return {
              id: String(store._id),
              image,
              title: store.name || "Store",
              description:
                store.description ||
                "Explore this verified store on Amstani & Co.",
              state: store.owner?.state || "",
              rating: store.rating ? String(store.rating) : "4.9",
              live: Boolean(store.isLive),
              liveLink: store.liveLink ?? null,
            };
          },
        );

        setStores(mapped);
      } catch {
        if (mounted) setStores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const initialState = getSelectedState();
    setSelectedState(initialState);
    loadStores(initialState);

    const unsubscribe = subscribeSelectedState((state) => {
      setSelectedState(state);
      loadStores(state);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const storeCountLabel = useMemo(() => {
    if (loading) return "Loading stores…";
    return `${stores.length} live stores`;
  }, [loading, stores.length]);

  return (
    <section data-tutorial-id="customer-digital-mall" className="bg-[#f5f6f8] pb-8 pt-4 dark:bg-slate-900 sm:pb-10">
      <div className="w-full px-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="w-full text-center sm:w-auto sm:text-left">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:justify-start sm:text-3xl">
              <Store className="h-6 w-6" />
              The Digital Mall
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real stores from across the platform.
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#56aebb] dark:text-[#7fd3df]">
              {selectedState
                ? `${selectedState} • ${storeCountLabel}`
                : storeCountLabel}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Loading real stores…
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            No active stores found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {stores.map((store) => (
              <article
                key={store.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-800"
              >
                <div
                  className="relative h-[280px] overflow-hidden"
                  style={{
                    backgroundImage: `url(${store.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-slate-900/25 to-black/85" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {store.live ? "Live" : "Store"}
                  </div>
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#56aebb] px-2.5 py-1 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-white text-white" />
                    {store.rating}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-semibold leading-tight">
                      {store.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/85">
                      {store.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-white/90">
                        <MapPin className="h-3.5 w-3.5" />
                        {store.state || "Nationwide"}
                      </span>

                      <a
                        href={`/store?storeId=${store.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Open Store
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
