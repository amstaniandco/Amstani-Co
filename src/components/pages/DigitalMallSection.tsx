"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Store, Volume2, VolumeX } from "lucide-react";
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
  videoUrl?: string | null;
};

export default function DigitalMallSection() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  // Which store card's video is currently unmuted (only one plays audio at a time)
  const [unmutedId, setUnmutedId] = useState<string | null>(null);

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
            const promoUrl = (store.promoImageUrl || "").trim();
            const promoIsVideo = store.promoMediaType === "video" && promoUrl;
            const promoImage = !promoIsVideo && promoUrl ? promoUrl : "";

            // Promotion media wins over the store's own banner.
            const imageSource = (promoImage || store.bannerUrl || store.logoUrl || "").trim();
            const image = imageSource.startsWith("https://")
              ? imageSource
              : "/assets/placeholder-store.svg";

            return {
              id: String(store._id),
              image,
              videoUrl: promoIsVideo ? promoUrl : null,
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#56aebb]/15 text-[#56aebb] dark:bg-[#7fd3df]/15 dark:text-[#7fd3df]">
              <Store className="h-7 w-7" />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {selectedState ? `No stores in ${selectedState} yet` : "No stores available yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {selectedState
                ? "We're bringing stores to this state soon — check back later."
                : "New stores are coming soon. Check back later."}
            </p>
            <span className="mt-4 inline-flex items-center rounded-full bg-[#56aebb]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#56aebb] dark:bg-[#7fd3df]/15 dark:text-[#7fd3df]">
              Coming soon
            </span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {stores.map((store) => (
              <a
                key={store.id}
                href={`/store?storeId=${store.id}`}
                className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-800"
              >
                <div
                  className="relative h-[280px] overflow-hidden bg-slate-900"
                  style={
                    store.videoUrl
                      ? undefined
                      : {
                          backgroundImage: `url(${store.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                  }
                >
                  {store.videoUrl && (
                    <video
                      key={store.videoUrl}
                      src={store.videoUrl}
                      autoPlay
                      loop
                      muted={unmutedId !== store.id}
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-slate-900/25 to-black/85" />
                  {store.videoUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUnmutedId((id) => (id === store.id ? null : store.id));
                      }}
                      className="absolute right-3 top-12 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                      aria-label={unmutedId === store.id ? "Mute video" : "Unmute video"}
                    >
                      {unmutedId === store.id ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-semibold leading-tight">
                      {store.title}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-white/90">
                      <MapPin className="h-3.5 w-3.5" />
                      {store.state || "Nationwide"}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
