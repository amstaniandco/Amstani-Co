"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Music2, VolumeX } from "lucide-react";
import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import StoreMobileActions from "./components/StoreMobileActions";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";
import { StoreProvider } from "../../../context/StoreContext";

type StoreSummary = {
  _id?: string;
  name?: string;
  [key: string]: unknown;
};

export default function StorePageClient() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [store, setStore] = useState<StoreSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const endpoint = storeId ? `/api/stores?storeId=${storeId}` : "/api/stores";
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const s = (data.stores || [])[0] || null;
        setStore(s);
      } catch (e) {
        console.error("Failed to fetch store for store page", e);
      }
    })();
    return () => { mounted = false; };
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/visits`, { method: "POST" }).catch(() => {});
  }, [storeId]);

  return (
    <div className="w-full py-6 dark:bg-slate-950">
      <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
        <StoreProvider store={store}>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMusicMuted((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#68B8C1] bg-[#eaf8fa] px-4 py-2.5 text-sm font-semibold text-[#68B8C1] shadow-sm transition hover:bg-[#ddf3f6] dark:border-[#4f9ea7] dark:bg-slate-800 dark:text-[#7dc8d1] dark:hover:bg-slate-700"
            >
              {isMusicMuted ? <VolumeX className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
              {isMusicMuted ? "Music Muted" : "Mute Store Music"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
            <div className="lg:col-span-2">
              <StoreHero />
            </div>
            <div className="hidden lg:flex lg:col-span-1">
              <LiveChat />
            </div>
            <div className="lg:col-span-3 hidden lg:block">
              <OfferingSection />
            </div>
          </div>

          <div className="lg:hidden mt-3">
            <StoreMobileActions />
          </div>

          <div className="hidden lg:block mt-5">
            <LiveStreamsSection />
          </div>

          <ProductGrid storeId={storeId} storeName={store?.name} />
          <StoreRatingSection />
        </StoreProvider>
      </div>
    </div>
  );
}
