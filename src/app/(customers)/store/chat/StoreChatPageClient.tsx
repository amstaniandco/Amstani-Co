"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LiveChat from "../components/LiveChat";
import { StoreProvider, type StoreInfo } from "../../../../context/StoreContext";
import { getSelectedState, subscribeSelectedState } from "../../../../lib/state-preference";
import { fetchStore } from "../../../../lib/store-cache";

export default function StoreChatPageClient() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    setSelectedState(getSelectedState());
    return subscribeSelectedState((state) => {
      setSelectedState(state);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchStore({ storeId, state: selectedState }).then((s) => {
      if (mounted) setStore(s);
    });
    return () => { mounted = false; };
  }, [storeId, selectedState]);

  const backHref = storeId ? `/store?storeId=${storeId}` : "/store";

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="text-lg">←</span>
            Back
          </Link>
        </div>

        <div className="rounded-[32px] bg-white p-4 shadow-sm">
          <StoreProvider store={store}>
            <LiveChat hideWrapper className="gap-4" />
          </StoreProvider>
        </div>
      </div>
    </div>
  );
}
