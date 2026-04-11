import Link from "next/link";
import type { LiveStore } from "../mockData";
import LiveStoreAvatar from "./LiveStoreAvatar";

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
          <LiveStoreAvatar key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
}
