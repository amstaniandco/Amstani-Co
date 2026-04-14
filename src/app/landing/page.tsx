import AmericaMap from "../../components/AmericaMap";
import BroadcastingRoomSection from "../../components/pages/BroadcastingRoomSection";
import ClaimStoreSection from "../../components/pages/ClaimStoreSection";
import DigitalMallSection from "../../components/pages/DigitalMallSection";
import GovernanceStandardsSection from "../../components/pages/GovernanceStandardsSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Map Hero Section */}
      <section className="py-2 sm:py-4">
        <div className="w-full px-4 sm:px-6">
          <AmericaMap />
        </div>
      </section>

      <DigitalMallSection />
      <BroadcastingRoomSection />
      <ClaimStoreSection />
      <GovernanceStandardsSection />
    </div>
  );
}
