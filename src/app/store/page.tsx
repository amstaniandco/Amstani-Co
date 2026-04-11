import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";

export default function StorePage() {
  return (
    <div className="w-full bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-6">
            <StoreHero />
            <OfferingSection />
          </div>
          <LiveChat />
        </div>

        <LiveStreamsSection />
        <ProductGrid />
        <StoreRatingSection />
      </div>
    </div>
  );
}
