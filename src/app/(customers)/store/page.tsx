import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";

export default function StorePage() {
  return (
    <div className="w-full bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
          <div className="lg:col-span-2">
            <StoreHero />
          </div>
          <div className="lg:col-span-1 flex">
            <LiveChat />
          </div>

          <div className="lg:col-span-3">
            <OfferingSection />
          </div>
        </div>

        <LiveStreamsSection />
        <ProductGrid />
        <StoreRatingSection />
      </div>
    </div>
  );
}
