import Link from "next/link";
import type { LiveStore } from "../mockData";

export default function LiveStoresSection({ liveStores }: { liveStores: LiveStore[] }) {
  return (
    <section className="home-section mb-5">
      <div className="mb-3">
        <h2 className="home-heading text-[24px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[28px]">
          Live Stores <span className="font-normal text-gray-400 dark:text-slate-400">({liveStores.length})</span>
        </h2>
      </div>

      {liveStores.length === 0 && (
        <p className="py-4 text-sm text-slate-400 dark:text-slate-500">No live stores right now</p>
      )}
      <div className="flex items-start gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {liveStores.map((store, index) => {
          const inner = (
            <>
              <div className="relative h-[100px] w-[82px] overflow-hidden rounded-md border border-[#ff6f6f] sm:h-[112px] sm:w-[94px]">
                <div className="relative h-full w-full rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.img}
                    alt={store.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {index === 0 && (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#2e73c7]/90 px-1 py-0.5 text-[10px] font-medium text-white">
                    Store
                  </span>
                )}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  LIVE
                </span>
              </div>
              <span className="w-full truncate text-center text-[11px] font-semibold text-slate-800 dark:text-slate-200 sm:text-sm">
                {store.name}
              </span>
            </>
          );

          if ((store as any).liveLink) {
            const raw: string = (store as any).liveLink;
            const href = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
            return (
              <a
                key={store.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[96px] flex-col items-center gap-2 cursor-pointer group sm:min-w-[104px]"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link
              key={store.id}
              href={`/store?storeId=${store.id}`}
              className="flex min-w-[96px] flex-col items-center gap-2 cursor-pointer group sm:min-w-[104px]"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
