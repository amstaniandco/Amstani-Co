import Image from "next/image";
import type { BrowseStore } from "../mockData";
import { BookmarkIcon, LocationIcon, StarIcon } from "./icons";

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
