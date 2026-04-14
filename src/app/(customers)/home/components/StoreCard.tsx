import Image from "next/image";
import type { BrowseStore } from "../mockData";

const StarIcon = () => (
  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function StoreCard({ store }: { store: BrowseStore }) {
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-[200px]">
        <Image
          src={store.img}
          alt={store.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-2 left-2">
          <span className={`${store.badgeColor} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
            {store.badge}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-teal-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {store.badge.startsWith("Ranked") ? store.badge : "Best #1"}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <StarIcon />
              <span className="text-white text-[10px] font-semibold">{store.rating}</span>
            </div>
            <button className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <BookmarkIcon />
            </button>
          </div>

          <h3 className="text-white font-bold text-sm leading-tight">{store.name}</h3>
          <p className="text-gray-300 text-[10px] mt-0.5 leading-snug line-clamp-1">{store.description}</p>

          <div className="flex items-center gap-1 mt-1">
            <LocationIcon />
            <span className="text-gray-300 text-[10px]">{store.state}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
