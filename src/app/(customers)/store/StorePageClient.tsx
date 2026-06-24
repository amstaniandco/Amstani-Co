"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Music2, VolumeX } from "lucide-react";
import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import StoreMobileActions from "./components/StoreMobileActions";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";
import { StoreProvider, type StoreInfo } from "../../../context/StoreContext";
import { getSelectedState, subscribeSelectedState } from "../../../lib/state-preference";

export default function StorePageClient() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const initialState = getSelectedState();
    setSelectedState(initialState);

    return subscribeSelectedState((state) => {
      setSelectedState(state);
    });
  }, []);

  // Load store data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const endpoint = storeId
          ? `/api/stores?storeId=${storeId}`
          : selectedState
            ? `/api/stores?state=${encodeURIComponent(selectedState)}`
            : "/api/stores";
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const s: StoreInfo = (data.stores || [])[0] || null;
        setStore(s);
      } catch (e) {
        console.error("Failed to fetch store for store page", e);
      }
    })();
    return () => { mounted = false; };
  }, [storeId, selectedState]);

  // Track visits
  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}/visits`, { method: "POST" }).catch(() => {});
  }, [storeId]);

  // Start / swap music when store loads or music URL changes
  useEffect(() => {
    const musicUrl = store?.settings?.musicUrl;
    if (!musicUrl) {
      audioRef.current?.pause();
      return;
    }

    // Create new audio element for this store's track
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.muted = isMusicMuted;
    audioRef.current = audio;
    audio.play().catch(() => {
      // Autoplay blocked by browser — user must interact first
    });

    return () => {
      audio.pause();
    };
    // Only re-run when the URL changes, not when mute changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.settings?.musicUrl]);

  // Sync mute state to the audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMusicMuted;
    }
  }, [isMusicMuted]);

  const hasMusicUrl = Boolean(store?.settings?.musicUrl);

  return (
    <div className="w-full py-6 dark:bg-slate-950">
      <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
        <StoreProvider store={store}>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMusicMuted((prev) => !prev)}
              disabled={!hasMusicUrl}
              title={!hasMusicUrl ? "This store has no music" : undefined}
              className="inline-flex items-center gap-2 rounded-xl border border-[#68B8C1] bg-[#eaf8fa] px-4 py-2.5 text-sm font-semibold text-[#68B8C1] shadow-sm transition hover:bg-[#ddf3f6] disabled:opacity-40 disabled:cursor-not-allowed dark:border-[#4f9ea7] dark:bg-slate-800 dark:text-[#7dc8d1] dark:hover:bg-slate-700"
            >
              {isMusicMuted ? <VolumeX className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
              {isMusicMuted ? "Music Muted" : "Mute Store Music"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
            <div className="lg:col-span-2 lg:self-start">
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
