import Link from "next/link";
import type { BrowseStore } from "../mockData";

const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StoreIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-5h16l1 5" />
    <path d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
    <path d="M5 9v11h14V9" />
    <path d="M10 14h4v6H10z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function StoreCard({ store }: { store: BrowseStore }) {
  return (
    <Link
      href={`/store?storeId=${store.id}`}
      className="home-store-card group relative block cursor-pointer overflow-hidden rounded-2xl border border-[#d7dde4] shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-lg dark:border-slate-700 dark:shadow-[0_8px_24px_rgba(2,6,23,0.45)]"
    >
      <div className="relative h-[280px] sm:h-[430px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.img}
          alt={store.name}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />

        {store.badge && (
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
            <span className={`${store.badgeColor} rounded-full px-2 py-0.5 text-[10px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs`}>
              {store.badge}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mb-2 flex items-center justify-between sm:mb-2.5">
            <h3 className="text-base font-semibold leading-tight text-white sm:text-xl">{store.name}</h3>
            {store.rating && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
                <StarIcon />
                <span>{store.rating}</span>
              </div>
            )}
          </div>

          <p className="line-clamp-1 text-xs leading-snug text-white/85 sm:text-sm">{store.description}</p>

          <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#68B8C1]/80 px-3 py-1 backdrop-blur-sm">
              <LocationIcon />
              <span className="text-sm font-medium text-white sm:text-base">{store.state}</span>
            </div>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#77cad4] text-white shadow-sm transition-colors hover:bg-[#63bcc7] sm:h-9 sm:w-9">
              <StoreIcon />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
