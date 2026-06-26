"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedState, setSelectedState] = useState("");

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

  return (
    <div className="w-full py-6 dark:bg-slate-950">
      <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
        <StoreProvider store={store}>
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
