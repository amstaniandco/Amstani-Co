"use client";

import { useState, useEffect } from "react";
import BrowseStoresSection from "./components/BrowseStoresSection";
import LiveStoresSection from "./components/LiveStoresSection";
import OnSaleSection from "./components/OnSaleSection";
import Sidebar from "./components/Sidebar";
import { ACTIVE_ORDERS, ON_SALE_STORES } from "./mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveStores, setLiveStores] = useState<any[]>([]);
  const [browseStores, setBrowseStores] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/stores');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const mapped = (data.stores || [])
          .filter((s: any) => s.isLive === true)
          .map((s: any, idx: number) => {
            const raw = (s.logoUrl || s.bannerUrl || "").trim();
            const isKnownHost = raw.startsWith("https://");
            const img = isKnownHost ? raw : '/assets/placeholder-store.svg';

            return {
              id: s._id || idx,
              img,
              name: s.name || 'Store',
              live: true,
              liveLink: s.liveLink || null,
            };
          });
        setLiveStores(mapped);
      } catch (e) {
        console.error('Failed to load live stores', e);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/stores/browse');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;

        const mapped = (data.stores || []).map((s: any) => ({
          id: s._id,
          name: s.name || 'Store',
          description: s.description || '',
          state: s.owner?.state || '',
          badge: 'Featured',
          badgeColor: 'bg-teal-500',
          rating: s.rating ? String(s.rating) : '4.9',
          img: ((s.logoUrl || s.bannerUrl) || '').startsWith('https://') ? (s.logoUrl || s.bannerUrl) : '/assets/placeholder-store.svg',
        }));

        setBrowseStores(mapped);
      } catch (e) {
        console.error('Failed to load browse stores', e);
      }
    })();

    return () => { mounted = false };
  }, []);

  return (
    <div className="home-shell min-h-screen bg-[#eef1f4] dark:bg-[#0c1322]">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-2 py-4 sm:px-3 lg:gap-7 lg:px-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <LiveStoresSection liveStores={liveStores.length ? liveStores : []} />
          <div className="lg:hidden">
            <OnSaleSection onSaleStores={ON_SALE_STORES} />
          </div>
          <BrowseStoresSection
            stores={browseStores.length ? browseStores : []}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        <Sidebar onSaleStores={ON_SALE_STORES} activeOrders={ACTIVE_ORDERS} />
      </div>
    </div>
  );
}
