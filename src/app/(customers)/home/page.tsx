"use client";

import { useState, useEffect } from "react";
import BrowseStoresSection from "./components/BrowseStoresSection";
import CategoriesSection from "./components/CategoriesSection";
import LiveStoresSection from "./components/LiveStoresSection";
import NewArrivalsSection from "./components/NewArrivalsSection";
import OnSaleSection from "./components/OnSaleSection";
import Sidebar from "./components/Sidebar";
import type { OnSaleStore, ActiveOrder } from "./mockData";
import { getSelectedState, subscribeSelectedState } from "../../../lib/state-preference";

const INACTIVE_STATUSES = new Set(["delivered", "cancelled", "rejected", "resolved"]);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveStores, setLiveStores] = useState<any[]>([]);
  const [browseStores, setBrowseStores] = useState<any[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [onSaleProducts, setOnSaleProducts] = useState<OnSaleStore[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);

  // Init from localStorage after mount (avoids SSR/client hydration mismatch)
  useEffect(() => {
    setStateFilter(getSelectedState());
    return subscribeSelectedState((s) => setStateFilter(s));
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : { categories: [] })
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch new arrivals
  useEffect(() => {
    fetch("/api/products/new-arrivals")
      .then((r) => r.ok ? r.json() : { products: [] })
      .then((data) => setNewArrivals((data.products || []).slice(0, 12)))
      .catch(() => {});
  }, []);

  // Fetch on-sale products
  useEffect(() => {
    fetch("/api/products/sale")
      .then((r) => r.ok ? r.json() : { products: [] })
      .then((data) => {
        const mapped: OnSaleStore[] = (data.products || []).slice(0, 5).map((p: any, i: number) => ({
          id: i,
          name: p.name || "Product",
          img: p.mainImage || "/assets/placeholder-store.svg",
        }));
        setOnSaleProducts(mapped);
      })
      .catch(() => {});
  }, []);

  // Fetch active orders
  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.ok ? r.json() : { orders: [] })
      .then((data) => {
        const mapped: ActiveOrder[] = (data.orders || [])
          .filter((o: any) => !INACTIVE_STATUSES.has((o.status || "").toLowerCase()))
          .slice(0, 2)
          .map((o: any) => ({
            id: o.orderNumber || o._id,
            status: (o.status || "PROCESSING").toUpperCase(),
            detail: o.items?.[0]?.name || "Item",
            sub: `${o.storeName || "Store"} · ${o.items?.length ?? 1} item${(o.items?.length ?? 1) !== 1 ? "s" : ""}`,
          }));
        setActiveOrders(mapped);
      })
      .catch(() => {});
  }, []);

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

    return () => { mounted = false };
  }, []);

  // Re-fetch browse stores whenever the selected state changes
  useEffect(() => {
    let mounted = true;
    setBrowseLoading(true);
    (async () => {
      try {
        const url = stateFilter
          ? `/api/stores/browse?state=${encodeURIComponent(stateFilter)}`
          : '/api/stores/browse';
        const res = await fetch(url);
        if (!res.ok) {
          if (mounted) setBrowseStores([]);
          return;
        }
        const data = await res.json();
        if (!mounted) return;

        const mapped = (data.stores || []).map((s: any) => ({
          id: s._id,
          name: s.name || 'Store',
          description: s.description || '',
          state: s.owner?.state || '',
          badge: s.isLive ? 'Live' : '',
          badgeColor: 'bg-red-500',
          rating: s.rating ? String(parseFloat(String(s.rating)).toFixed(1)) : '',
          img: ((s.logoUrl || s.bannerUrl) || '').startsWith('https://') ? (s.logoUrl || s.bannerUrl) : '/assets/placeholder-store.svg',
          isPromoted: s.isPromoted || false,
          isLive: s.isLive || false,
        }));

        // Promoted stores first
        mapped.sort((a: any, b: any) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));

        setBrowseStores(mapped);
      } catch (e) {
        console.error('Failed to load browse stores', e);
        if (mounted) setBrowseStores([]);
      } finally {
        if (mounted) setBrowseLoading(false);
      }
    })();

    return () => { mounted = false };
  }, [stateFilter]);

  return (
    <div className="home-shell min-h-screen bg-[#eef1f4] dark:bg-[#0c1322]">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-2 py-4 sm:px-3 lg:gap-7 lg:px-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <LiveStoresSection liveStores={liveStores} />
          <CategoriesSection categories={categories} />
          <NewArrivalsSection products={newArrivals} />
          <div className="lg:hidden">
            <OnSaleSection onSaleStores={onSaleProducts} />
          </div>
          <BrowseStoresSection
            stores={browseStores}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            stateFilter={stateFilter}
            loading={browseLoading}
          />
        </div>

        <Sidebar onSaleStores={onSaleProducts} activeOrders={activeOrders} />
      </div>
    </div>
  );
}
