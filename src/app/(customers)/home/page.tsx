"use client";

import { useState } from "react";
import BrowseStoresSection from "./components/BrowseStoresSection";
import LiveStoresSection from "./components/LiveStoresSection";
import OnSaleSection from "./components/OnSaleSection";
import Sidebar from "./components/Sidebar";
import { ACTIVE_ORDERS, BROWSE_STORES, LIVE_STORES, ON_SALE_STORES } from "./mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="home-shell min-h-screen bg-[#eef1f4] dark:bg-[#0c1322]">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-2 py-4 sm:px-3 lg:gap-7 lg:px-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <LiveStoresSection liveStores={LIVE_STORES} />
          <div className="lg:hidden">
            <OnSaleSection onSaleStores={ON_SALE_STORES} />
          </div>
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
