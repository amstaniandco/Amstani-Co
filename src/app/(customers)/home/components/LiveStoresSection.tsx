import Image from "next/image";
import Link from "next/link";
import type { LiveStore } from "../mockData";

export default function LiveStoresSection({ liveStores }: { liveStores: LiveStore[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Live Stores <span className="text-gray-400 font-normal">(11)</span>
        </h2>
        <Link href="/stores/live" className="text-sm text-teal-600 font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {liveStores.map((store) => (
          <div key={store.id} className="flex flex-col items-center gap-1.5 cursor-pointer group">
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
        ))}
      </div>
    </section>
  );
}
