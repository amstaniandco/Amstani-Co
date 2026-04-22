import Image from "next/image";
import Link from "next/link";
import type { LiveStore } from "../mockData";

export default function LiveStoresSection({ liveStores }: { liveStores: LiveStore[] }) {
  return (
    <section className="home-section mb-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="home-heading text-[24px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[28px]">
          Live Stores <span className="font-normal text-gray-400 dark:text-slate-400">(11)</span>
        </h2>
        <Link href="/store" className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline dark:text-slate-300 dark:hover:text-white sm:text-sm">
          View All
        </Link>
      </div>

      <div className="flex items-start gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {liveStores.map((store, index) => (
          <Link key={store.id} href="/store" className="flex min-w-[96px] flex-col items-center gap-2 cursor-pointer group sm:min-w-[104px]">
            <div
              className={`relative h-[100px] w-[82px] overflow-hidden rounded-md ${store.live ? "border border-[#ff6f6f]" : "border border-gray-300 dark:border-slate-600"} sm:h-[112px] sm:w-[94px]`}
            >
              <div className="relative h-full w-full rounded-sm">
                <Image
                  src={store.img}
                  alt={store.name}
                  fill
                  sizes="(max-width: 640px) 82px, 94px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#2e73c7]/90 px-1 py-0.5 text-[10px] font-medium text-white">
                  Store
                </span>
              )}
            </div>
            <span className="w-full truncate text-center text-[11px] font-semibold text-slate-800 dark:text-slate-200 sm:text-sm">
              {store.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
