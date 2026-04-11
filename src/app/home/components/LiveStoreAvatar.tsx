import Image from "next/image";
import type { LiveStore } from "../mockData";

export default function LiveStoreAvatar({ store }: { store: LiveStore }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
      <div
        className={`relative w-16 h-20 rounded-sm overflow-hidden ${store.live ? "border-2 border-red-500" : "border-2 border-gray-200"}`}
      >
        <div className="w-full h-full rounded-sm relative">
          <Image
            src={store.img}
            alt={store.name}
            fill
            sizes="64px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <span className="text-[11px] text-gray-600 font-medium text-center truncate w-16">
        {store.name}
      </span>
    </div>
  );
}
