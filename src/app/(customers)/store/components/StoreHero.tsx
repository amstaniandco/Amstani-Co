"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, Loader2 } from "lucide-react";
import { useStore } from "../../../../context/StoreContext";

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function StoreHero() {
  const [showLanguages, setShowLanguages] = useState(false);
  const store = useStore();

  const [followerCount, setFollowerCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  useEffect(() => {
    if (!store?._id) return;
    fetch(`/api/stores/${store._id}/stats`)
      .then((r) => r.json())
      .then((d) => {
        setFollowerCount(d.followerCount ?? 0);
        setProductCount(d.productCount ?? 0);
        setIsFollowing(d.isFollowing ?? false);
        setStatsLoaded(true);
      })
      .catch(() => setStatsLoaded(true));
  }, [store?._id]);

  const handleFollow = async () => {
    if (!store?._id || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/stores/${store._id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowerCount(data.followerCount);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="ui-panel flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700">
        <Image
          src={store?.bannerUrl || store?.logoUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80"}
          alt={store?.name ?? "Store banner"}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:min-w-0 sm:flex-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full overflow-hidden bg-slate-200 text-xl font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {store?.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name || "logo"} width={64} height={64} className="object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">S</div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{store?.name || "Name of the store"}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {store?.description || "Description of the store can be written here"}
            </p>

            {store?.settings?.languages?.length ? (
              <div className="relative mt-3 flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLanguages((prev) => !prev)}
                    aria-label="View languages spoken"
                    className="inline-flex h-7 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Languages
                  </button>
                  {showLanguages && (
                    <div className="ui-subpanel absolute left-0 top-9 z-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-md dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                      {store.settings!.languages!.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:shrink-0 sm:pl-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {statsLoaded ? formatCount(productCount) : "—"}
            </p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {statsLoaded ? formatCount(followerCount) : "—"}
            </p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">Followers</p>
          </div>

          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading || !store?._id}
            className={`inline-flex items-center gap-2 rounded-full px-7 py-2 text-sm font-semibold transition sm:ml-2 disabled:opacity-60 ${
              isFollowing
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100"
                : "bg-[#68B8C1] text-white hover:bg-[#4f9ea7]"
            }`}
          >
            {followLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}
