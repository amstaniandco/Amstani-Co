"use client";

import { useState } from "react";
import { Music2, VolumeX } from "lucide-react";
import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import StoreMobileActions from "./components/StoreMobileActions";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";

export default function StorePage() {
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  return (
    <div className="w-full py-6">
      <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsMusicMuted((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#68B8C1] bg-[#eaf8fa] px-4 py-2.5 text-sm font-semibold text-[#68B8C1] shadow-sm transition hover:bg-[#ddf3f6]"
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

        <ProductGrid />
        <StoreRatingSection />
      </div>
    </div>
  );
}
