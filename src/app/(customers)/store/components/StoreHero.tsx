"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, Loader2, Trophy } from "lucide-react";
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
  const [rank, setRank] = useState<number | null>(null);
  useEffect(() => {
    if (!store?._id) return;
    fetch(`/api/stores/${store._id}/stats`)
      .then((r) => r.json())
      .then((d) => {
        setFollowerCount(d.followerCount ?? 0);
        setProductCount(d.productCount ?? 0);
        setIsFollowing(d.isFollowing ?? false);
        setRank(d.rank ?? null);
        setStatsLoaded(true);
      })
      .catch(() => setStatsLoaded(true));
  }, [store?._id]);

  const handleFollow = async () => {
    if (!store?._id || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/stores/${store._id}/follow`, {
        method: "POST",
      });
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
    <div className="ui-panel flex flex-col rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="relative h-[120px] w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700 sm:h-[260px]">
        <Image
          src={store?.bannerUrl || store?.logoUrl || "/default-banner.jpg"}
          alt={store?.name ?? "Store banner"}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      <div className="mt-4 p-5">
        {/* Row 1: logo + name/bio (side-by-side on all sizes) */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xl font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200 sm:h-16 sm:w-16">
            {store?.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name || "logo"}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>S</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {store?.name || "Name of the store"}
              </h2>
              {rank !== null && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                  <Trophy className="h-3 w-3" />
                  Ranked #{rank}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {store?.description || "Description of the store can be written here"}
            </p>

            {/* Languages: only on sm+ in this position */}
            {store?.settings?.languages?.length ? (
              <div className="relative mt-3 hidden sm:flex flex-wrap items-center gap-2">
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

          {/* Stats + follow: sm+ only, right-side column */}
          <div className="hidden sm:flex sm:shrink-0 sm:items-center sm:gap-4 sm:pl-3">
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
              className={`ml-2 inline-flex items-center gap-2 rounded-full px-7 py-2 text-sm font-semibold transition disabled:opacity-60 ${
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

        {/* Row 2 (mobile only): ranked tag + languages */}
        {(rank !== null || store?.settings?.languages?.length) ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
            {rank !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                <Trophy className="h-3 w-3" />
                Ranked #{rank}
              </span>
            )}
            {store?.settings?.languages?.length ? (
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
            ) : null}
          </div>
        ) : null}

        {/* Row 3 (mobile only): stats + follow in one line */}
        <div className="mt-4 flex items-center gap-5 sm:hidden">
          <div className="flex gap-6">
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
          </div>
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading || !store?._id}
            className={`inline-flex items-center gap-2 rounded-full px-7 py-2 text-sm font-semibold transition disabled:opacity-60 ${
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
