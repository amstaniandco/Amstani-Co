import StoreHero from "./components/StoreHero";
import LiveChat from "./components/LiveChat";
import StoreMobileActions from "./components/StoreMobileActions";
import OfferingSection from "./components/OfferingSection";
import LiveStreamsSection from "./components/LiveStreamsSection";
import ProductGrid from "./components/ProductGrid";
import StoreRatingSection from "./components/StoreRatingSection";

export default function StorePage() {
  return (
    <div className="w-full py-6">
      <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
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
