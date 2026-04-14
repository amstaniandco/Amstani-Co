"use client";

import { useState } from "react";
import BrowseStoresSection from "./components/BrowseStoresSection";
import LiveStoresSection from "./components/LiveStoresSection";
import Sidebar from "./components/Sidebar";
import { ACTIVE_ORDERS, BROWSE_STORES, LIVE_STORES, ON_SALE_STORES } from "./mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <div className="w-full mx-auto px-4 py-6 flex gap-5">
        <div className="flex-1 min-w-0">
          <LiveStoresSection liveStores={LIVE_STORES} />
          <BrowseStoresSection
            stores={BROWSE_STORES}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        <Sidebar onSaleStores={ON_SALE_STORES} activeOrders={ACTIVE_ORDERS} />
      </div>
    </div>
  );
}
