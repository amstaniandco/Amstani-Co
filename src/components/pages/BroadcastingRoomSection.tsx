import Link from "next/link";
import { Lock } from "lucide-react";

type BroadcastCard = {
  id: number;
  brand: string;
  tag: string;
  image: string;
};

const broadcastCards: BroadcastCard[] = [
  {
    id: 1,
    brand: "Loom & Line",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    brand: "Silk Atlas",
    tag: "Store",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    brand: "Indigo Thread",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    brand: "Urban Weave",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    brand: "Cedar Cloth",
    tag: "Craft",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    brand: "Saffron Loom",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    brand: "Nova Textile",
    tag: "Store",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 8,
    brand: "Velvet Yard",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 9,
    brand: "Threadhouse",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 10,
    brand: "Aura Fabric",
    tag: "Craft",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 11,
    brand: "Harbor Stitch",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 12,
    brand: "Marble Loom",
    tag: "Store",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 13,
    brand: "Copper Weft",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 14,
    brand: "Drift Textile",
    tag: "Live",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 15,
    brand: "Opal Threads",
    tag: "Craft",
    image:
      "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 16,
    brand: "Monarch Stitch",
    tag: "Store",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  },
];

export default function BroadcastingRoomSection() {
  return (
    <section data-tutorial-id="customer-broadcasting-room" className="bg-[#f2f3f6] py-8 dark:bg-slate-900 sm:py-10">
      <div className="w-full px-6">
        <div className="rounded-xl border border-slate-200 bg-[#f5f6f8] px-4 py-5 dark:border-slate-700 dark:bg-slate-800 sm:px-6 sm:py-6">
          <h2 className="text-[18px] font-semibold leading-none text-slate-900 dark:text-slate-100 sm:text-[40px]">
            Broadcasting Room
          </h2>
          <p className="mt-1.5 text-xs font-normal text-slate-500 dark:text-slate-400 sm:text-[18px]">
            Live updates from textile artisans across the country
          </p>

          <div className="relative mt-5">
            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2 xl:grid-cols-[repeat(14,minmax(0,1fr))] 2xl:grid-cols-[repeat(16,minmax(0,1fr))]">
              {broadcastCards.map((card, index) => {
                const visibilityClass =
                  index >= 14
                    ? "hidden 2xl:block"
                    : index >= 10
                      ? "hidden xl:block"
                      : index >= 5
                        ? "hidden sm:block"
                      : "block";

                return (
                <div key={card.id} className={`min-w-0 ${visibilityClass}`}>
                  <div
                    className="relative h-[52px] w-full overflow-hidden rounded-lg border border-rose-300 bg-cover bg-center grayscale-[35%] brightness-110 sm:h-[74px]"
                    style={{ backgroundImage: `url(${card.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/35 to-white/15 dark:from-slate-900/40 dark:to-slate-900/20" />
                    <div className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-white/40 dark:bg-slate-300/25" />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-white/85 px-1 py-[1px] text-[8px] font-semibold leading-none text-slate-700">
                      {card.tag}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-center text-[10px] text-slate-500 dark:text-slate-300 sm:text-xs">{card.brand}</p>
                </div>
                );
              })}
            </div>

            <Link
              href="/home"
              className="absolute left-1/2 top-1/2 inline-flex max-w-[90%] -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-[#56aebb] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition hover:bg-[#489fad] sm:px-6 sm:py-2.5 sm:text-xl"
            >
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Explore Live Stores
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
